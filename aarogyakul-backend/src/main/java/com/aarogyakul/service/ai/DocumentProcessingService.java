package com.aarogyakul.service.ai;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.*;
import com.aarogyakul.repository.*;
import com.aarogyakul.util.Enums.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;

@Service
public class DocumentProcessingService {
    private final MedicalDocumentRepository documents;
    private final MedicalParameterRepository parameters;
    private final AiInsightRepository insights;
    private final TimelineEventRepository events;
    private final OcrService ocrService;
    private final ParameterExtractionService extractionService;
    private final ComparisonService comparisonService;
    private final InsightGenerationService insightGenerationService;
    private final LlamaClient llamaClient;
    private final ObjectMapper objectMapper;

    public DocumentProcessingService(MedicalDocumentRepository documents, MedicalParameterRepository parameters,
                                     AiInsightRepository insights, TimelineEventRepository events, OcrService ocrService,
                                     ParameterExtractionService extractionService, ComparisonService comparisonService,
                                     InsightGenerationService insightGenerationService, LlamaClient llamaClient,
                                     ObjectMapper objectMapper) {
        this.documents = documents;
        this.parameters = parameters;
        this.insights = insights;
        this.events = events;
        this.ocrService = ocrService;
        this.extractionService = extractionService;
        this.comparisonService = comparisonService;
        this.insightGenerationService = insightGenerationService;
        this.llamaClient = llamaClient;
        this.objectMapper = objectMapper;
    }

    @Async("aiTaskExecutor")
    @Transactional
    public void process(UUID documentId, Path tempPdf) {
        try {
            MedicalDocument document = documents.findById(documentId).orElseThrow();
            document.processingStatus = ProcessingStatus.PROCESSING;
            document.processingError = null;
            documents.saveAndFlush(document);

            String text = ocrService.extractText(tempPdf);
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
                saved.add(parameters.save(parameter));
            }

            List<ComparisonData> comparisons = comparisonService.compare(saved);
            AiInsight insight = new AiInsight();
            insight.document = document;
            insight.familyMember = document.familyMember;
            insight.summaryText = insightGenerationService.generate(comparisons);
            insight.comparisonJson = objectMapper.writeValueAsString(Map.of("parameters", comparisons));
            insight.modelUsed = llamaClient.modelName();
            insights.save(insight);

            document.processingStatus = ProcessingStatus.COMPLETED;
            documents.save(document);
            createTimelineEvent(document, saved);
        } catch (Exception e) {
            markFailed(documentId, e.getMessage());
        } finally {
            try {
                Files.deleteIfExists(tempPdf);
            } catch (Exception ignored) {
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

    @Transactional
    void markFailed(UUID documentId, String message) {
        documents.findById(documentId).ifPresent(document -> {
            document.processingStatus = ProcessingStatus.FAILED;
            document.processingError = message == null || message.isBlank() ? "Document processing failed" : message;
            documents.save(document);
        });
    }
}
