package com.aarogyakul.service.ai;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.*;
import com.aarogyakul.repository.MedicalParameterRepository;
import com.aarogyakul.util.Enums.DocumentType;
import com.aarogyakul.util.ParameterUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class LabReportProcessor implements DocumentCategoryProcessor {
    private static final Logger log = LoggerFactory.getLogger(LabReportProcessor.class);

    private final ParameterExtractionService extractionService;
    private final ComparisonService comparisonService;
    private final InsightGenerationService insightGenerationService;
    private final MedicalParameterRepository parameters;
    private final LlamaClient llamaClient;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public LabReportProcessor(ParameterExtractionService extractionService, ComparisonService comparisonService,
                              InsightGenerationService insightGenerationService, MedicalParameterRepository parameters,
                              LlamaClient llamaClient, com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.extractionService = extractionService;
        this.comparisonService = comparisonService;
        this.insightGenerationService = insightGenerationService;
        this.parameters = parameters;
        this.llamaClient = llamaClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean supports(DocumentType type) {
        return type == DocumentType.BLOOD_REPORT || type == DocumentType.LAB_REPORT;
    }

    @Override
    public AiInsight process(MedicalDocument document, String extractedText) {
        // Extraction
        ExtractedReport report = extractionService.extract(extractedText);
        LocalDate reportDate = report.reportDate() == null ? LocalDate.now() : report.reportDate();
        document.reportDate = reportDate;

        // Validation & Persistence
        List<MedicalParameter> saved = new ArrayList<>();
        for (ExtractedParameter extracted : report.parameters()) {
            if (!ParameterUtils.isSafeForStorage(extracted.value())) {
                log.warn("Skipping parameter '{}': value {} exceeds bounds", extracted.name(), extracted.value());
                continue;
            }
            try {
                // Apply our new explicit validation rule: Name is primary, everything else secondary.
                String validName = DataValidator.validatePrimaryString(extracted.name(), "parameterName");
                
                MedicalParameter parameter = new MedicalParameter();
                parameter.document = document;
                parameter.familyMember = document.familyMember;
                parameter.parameterName = validName;
                parameter.value = DataValidator.validateNumeric10_3(extracted.value(), "value");
                if (parameter.value == null) {
                     continue; // Value is essential for a lab parameter
                }
                parameter.unit = DataValidator.validateSecondaryString(extracted.unit(), "unit");
                
                // Only take bounds if they are safe, otherwise degrade to null
                parameter.referenceRangeLow = ParameterUtils.isSafeForStorage(extracted.referenceRangeLow()) 
                        ? DataValidator.validateNumeric10_3(extracted.referenceRangeLow(), "referenceRangeLow") : null;
                parameter.referenceRangeHigh = ParameterUtils.isSafeForStorage(extracted.referenceRangeHigh())
                        ? DataValidator.validateNumeric10_3(extracted.referenceRangeHigh(), "referenceRangeHigh") : null;

                parameter.reportDate = reportDate;
                parameter.confidence = ParameterUtils.assessConfidence(validName, extracted.value()).name();
                saved.add(parameters.save(parameter));
            } catch (ExtractionValidationException e) {
                log.warn("Skipping parameter due to validation error: {}", e.getMessage());
            }
        }

        // Comparison & Summary
        List<ComparisonData> comparisons = comparisonService.compare(saved);
        String summary = insightGenerationService.generate(comparisons);
        
        AiInsight insight = new AiInsight();
        insight.document = document;
        insight.familyMember = document.familyMember;
        insight.summaryText = summary;
        try {
            insight.comparisonJson = objectMapper.writeValueAsString(Map.of("parameters", comparisons));
        } catch (Exception e) {
            insight.comparisonJson = "{}";
        }
        insight.modelUsed = llamaClient.modelName();
        return insight;
    }
}
