package com.aarogyakul.service.ai;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.*;
import com.aarogyakul.repository.*;
import com.aarogyakul.util.Enums.*;
import com.aarogyakul.util.ParameterUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.file.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class DocumentProcessingService {
    private static final Logger log = LoggerFactory.getLogger(DocumentProcessingService.class);
    private static final int MAX_RETRIES = 3;
    private static final int STUCK_THRESHOLD_MINUTES = 10;

    private final MedicalDocumentRepository documents;
    private final MedicalParameterRepository parameters;
    private final AiInsightRepository insights;
    private final TimelineEventRepository events;
    private final OcrService ocrService;
    private final ParameterExtractionService extractionService;
    private final ComparisonService comparisonService;
    private final InsightGenerationService insightGenerationService;
    private final DocumentStatusService statusService;
    private final LlamaClient llamaClient;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final MeterRegistry meterRegistry;

    public DocumentProcessingService(MedicalDocumentRepository documents, MedicalParameterRepository parameters,
                                     AiInsightRepository insights, TimelineEventRepository events, OcrService ocrService,
                                     ParameterExtractionService extractionService, ComparisonService comparisonService,
                                     InsightGenerationService insightGenerationService, DocumentStatusService statusService,
                                     LlamaClient llamaClient, ObjectMapper objectMapper,
                                     ApplicationEventPublisher eventPublisher, MeterRegistry meterRegistry) {
        this.documents = documents;
        this.parameters = parameters;
        this.insights = insights;
        this.events = events;
        this.ocrService = ocrService;
        this.extractionService = extractionService;
        this.comparisonService = comparisonService;
        this.insightGenerationService = insightGenerationService;
        this.statusService = statusService;
        this.llamaClient = llamaClient;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
        this.meterRegistry = meterRegistry;
    }

    @Async("aiTaskExecutor")
    public void process(UUID documentId, Path tempPdf) {
        Timer.Sample timerSample = Timer.start(meterRegistry);
        try {
            log.info("Starting AI pipeline for document {}", documentId);
            statusService.markProcessing(documentId);

            MedicalDocument document = documents.findById(documentId).orElseThrow();

            log.info("Stage 1/5: Extracting text from PDF for document {}", documentId);
            publishStage(documentId, ProcessingStageEvent.EXTRACTING_TEXT, "Reading your PDF...");
            String text = ocrService.extractText(tempPdf);

            log.info("Stage 2/5: Extracting parameters via LLM for document {}", documentId);
            publishStage(documentId, ProcessingStageEvent.IDENTIFYING_PARAMETERS, "Identifying lab parameters...");
            ExtractedReport report = extractionService.extract(text);
            LocalDate reportDate = report.reportDate() == null ? LocalDate.now() : report.reportDate();
            document.reportDate = reportDate;

            List<MedicalParameter> saved = new ArrayList<>();
            for (ExtractedParameter extracted : report.parameters()) {
                MedicalParameter parameter = new MedicalParameter();
                parameter.document = document;
                parameter.familyMember = document.familyMember;
                parameter.parameterName = extracted.name();
                parameter.value = extracted.value();
                parameter.unit = extracted.unit();
                parameter.referenceRangeLow = extracted.referenceRangeLow();
                parameter.referenceRangeHigh = extracted.referenceRangeHigh();
                parameter.reportDate = reportDate;
                parameter.confidence = ParameterUtils.assessConfidence(extracted.name(), extracted.value()).name();
                saved.add(parameters.save(parameter));
            }
            log.info("Stage 3/5: Extracted {} parameters for document {}", saved.size(), documentId);

            log.info("Stage 4/5: Comparing with historical values for document {}", documentId);
            publishStage(documentId, ProcessingStageEvent.COMPARING_HISTORY, "Comparing with previous results...");
            List<ComparisonData> comparisons = comparisonService.compare(saved);

            log.info("Stage 5/5: Generating AI summary for document {}", documentId);
            publishStage(documentId, ProcessingStageEvent.GENERATING_SUMMARY, "Writing your health summary...");
            AiInsight insight = new AiInsight();
            insight.document = document;
            insight.familyMember = document.familyMember;
            insight.summaryText = insightGenerationService.generate(comparisons);
            insight.comparisonJson = objectMapper.writeValueAsString(Map.of("parameters", comparisons));
            insight.modelUsed = llamaClient.modelName();
            insights.save(insight);

            documents.save(document);
            statusService.markCompleted(documentId);
            createTimelineEvent(document, saved);
            publishStage(documentId, ProcessingStageEvent.COMPLETED, "Your results are ready!");
            log.info("AI pipeline COMPLETED for document {} — {} parameters extracted", documentId, saved.size());
            timerSample.stop(Timer.builder("aarogyakul.ai.pipeline.duration")
                    .tag("status", "success").register(meterRegistry));
        } catch (Exception e) {
            log.error("AI pipeline FAILED for document {}: {}", documentId, e.getMessage(), e);
            statusService.markFailed(documentId, e.getMessage());
            publishStage(documentId, ProcessingStageEvent.FAILED, e.getMessage() != null ? e.getMessage() : "Processing failed");
            meterRegistry.counter("aarogyakul.ai.pipeline.failures").increment();
            timerSample.stop(Timer.builder("aarogyakul.ai.pipeline.duration")
                    .tag("status", "failure").register(meterRegistry));
        } finally {
            try {
                Files.deleteIfExists(tempPdf);
            } catch (Exception ignored) {
            }
        }
    }

    /**
     * Recovers documents stuck in PROCESSING state for more than the threshold.
     * Runs every 5 minutes. Marks stuck documents as FAILED so they can be retried
     * or reported to the user.
     */
    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void recoverStuckDocuments() {
        Instant cutoff = Instant.now().minus(STUCK_THRESHOLD_MINUTES, ChronoUnit.MINUTES);
        List<MedicalDocument> stuck = documents.findByProcessingStatusAndUpdatedAtBefore(
                ProcessingStatus.PROCESSING, cutoff);

        if (stuck.isEmpty()) return;

        log.warn("Found {} stuck documents in PROCESSING state", stuck.size());
        for (MedicalDocument doc : stuck) {
            if (doc.retryCount < MAX_RETRIES) {
                log.info("Marking stuck document {} as FAILED for retry (attempt {}/{})", doc.id, doc.retryCount + 1, MAX_RETRIES);
                statusService.markFailed(doc.id, "Processing timed out — will be retried automatically");
            } else {
                log.error("Document {} has exceeded max retries ({}), marking permanently FAILED", doc.id, MAX_RETRIES);
                statusService.markFailed(doc.id, "Processing failed after " + MAX_RETRIES + " attempts. Please re-upload.");
            }
        }
    }

    private void createTimelineEvent(MedicalDocument document, List<MedicalParameter> saved) {
        TimelineEvent event = new TimelineEvent();
        event.familyMember = document.familyMember;
        event.eventType = TimelineEventType.DOCUMENT_UPLOAD;
        event.eventDate = document.reportDate == null ? LocalDate.now() : document.reportDate;
        event.title = document.documentType == DocumentType.BLOOD_REPORT ? "Blood Test Uploaded" : "Document Uploaded";
        String names = saved.stream().map(p -> p.parameterName).distinct().limit(6).reduce((a, b) -> a + ", " + b).orElse("No parameters");
        event.description = "Extracted parameters: " + names;
        event.relatedDocument = document;
        events.save(event);
    }

    private void publishStage(UUID documentId, String stage, String message) {
        try {
            eventPublisher.publishEvent(new ProcessingStageEvent(documentId, stage, message));
        } catch (Exception e) {
            log.debug("Failed to publish SSE event for document {}: {}", documentId, e.getMessage());
        }
    }
}
