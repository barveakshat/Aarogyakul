package com.aarogyakul.service.ai;

import com.aarogyakul.entity.*;
import com.aarogyakul.repository.*;
import com.aarogyakul.util.Enums.*;
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
    private final AiInsightRepository insights;
    private final TimelineEventRepository events;
    private final OcrService ocrService;
    private final DocumentStatusService statusService;
    private final List<DocumentCategoryProcessor> processors;
    private final GenericDocumentProcessor genericProcessor;
    private final ApplicationEventPublisher eventPublisher;
    private final MeterRegistry meterRegistry;

    public DocumentProcessingService(MedicalDocumentRepository documents, AiInsightRepository insights,
                                     TimelineEventRepository events, OcrService ocrService,
                                     DocumentStatusService statusService, List<DocumentCategoryProcessor> processors,
                                     GenericDocumentProcessor genericProcessor,
                                     ApplicationEventPublisher eventPublisher, MeterRegistry meterRegistry) {
        this.documents = documents;
        this.insights = insights;
        this.events = events;
        this.ocrService = ocrService;
        this.statusService = statusService;
        this.processors = processors;
        this.genericProcessor = genericProcessor;
        this.eventPublisher = eventPublisher;
        this.meterRegistry = meterRegistry;
    }

    @Async("aiTaskExecutor")
    public void process(UUID documentId, Path tempPdf) {
        Timer.Sample timerSample = Timer.start(meterRegistry);
        String currentStageKey = ProcessingStageEvent.EXTRACTING_TEXT;
        try {
            log.info("Starting AI pipeline for document {}", documentId);
            statusService.markProcessing(documentId);

            MedicalDocument document = documents.findById(documentId).orElseThrow();

            log.info("Stage 1/3: Extracting text from PDF for document {}", documentId);
            publishStage(documentId, currentStageKey, "Reading your PDF...");
            String text = ocrService.extractText(tempPdf);

            log.info("Stage 2/3: Extracting data via LLM for document {}", documentId);
            currentStageKey = ProcessingStageEvent.IDENTIFYING_PARAMETERS;
            publishStage(documentId, currentStageKey, "Analyzing document contents...");
            
            DocumentCategoryProcessor processor = processors.stream()
                    .filter(p -> p.supports(document.documentType) && p != genericProcessor)
                    .findFirst()
                    .orElse(genericProcessor);

            AiInsight insight = processor.process(document, text);

            log.info("Stage 3/3: Saving generated insights and metadata for document {}", documentId);
            currentStageKey = ProcessingStageEvent.GENERATING_SUMMARY;
            publishStage(documentId, currentStageKey, "Finalizing your results...");
            insights.save(insight);

            documents.save(document);
            statusService.markCompleted(documentId);
            createTimelineEvent(document, insight);
            
            currentStageKey = ProcessingStageEvent.COMPLETED;
            publishStage(documentId, currentStageKey, "Your results are ready!");
            log.info("AI pipeline COMPLETED for document {}", documentId);
            timerSample.stop(Timer.builder("aarogyakul.ai.pipeline.duration")
                    .tag("status", "success").register(meterRegistry));
        } catch (ExtractionValidationException e) {
            log.error("AI pipeline FAILED for document {}: Validation error {}", documentId, e.getMessage());
            statusService.markFailed(documentId, "Validation Error: " + e.getMessage());
            publishStage(documentId, ProcessingStageEvent.FAILED, "We couldn't safely read some data from this document.");
            meterRegistry.counter("aarogyakul.ai.pipeline.failures").increment();
            timerSample.stop(Timer.builder("aarogyakul.ai.pipeline.duration")
                    .tag("status", "failure").register(meterRegistry));
        } catch (Exception e) {
            log.error("AI pipeline FAILED for document {}: {}", documentId, e.getMessage(), e);
            statusService.markFailed(documentId, currentStageKey + "|" + e.getMessage());
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

    private void createTimelineEvent(MedicalDocument document, AiInsight insight) {
        TimelineEvent event = new TimelineEvent();
        event.familyMember = document.familyMember;
        event.eventType = TimelineEventType.DOCUMENT_UPLOAD;
        event.eventDate = document.reportDate == null ? LocalDate.now() : document.reportDate;
        
        switch (document.documentType) {
            case BLOOD_REPORT, LAB_REPORT -> {
                event.title = "Lab Test Uploaded";
                event.description = "Extracted lab parameters.";
            }
            case PRESCRIPTION -> {
                event.title = "Prescription Uploaded";
                event.description = "Medication details extracted.";
            }
            case VACCINATION -> {
                event.title = "Vaccination Uploaded";
                event.description = "Vaccine details extracted.";
            }
            case BILL -> {
                event.title = "Medical Bill Uploaded";
                event.description = "Invoice details extracted.";
            }
            default -> {
                event.title = "Document Uploaded";
                event.description = insight.summaryText != null && insight.summaryText.length() > 50 
                        ? insight.summaryText.substring(0, 47) + "..." 
                        : "Processed document.";
            }
        }
        
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
