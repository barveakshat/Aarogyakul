package com.aarogyakul.service.ai;

import com.aarogyakul.entity.AiInsight;
import com.aarogyakul.entity.MedicalDocument;
import com.aarogyakul.entity.Prescription;
import com.aarogyakul.repository.PrescriptionRepository;
import com.aarogyakul.util.Enums.DocumentType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class PrescriptionProcessor implements DocumentCategoryProcessor {
    private static final Logger log = LoggerFactory.getLogger(PrescriptionProcessor.class);

    private static final String PROMPT = """
            You are a medical document parser. Extract prescription details from the text below.
            Identify all prescribed medications. For each, extract: medicationName, dosage, frequency, and duration.
            Also extract the prescribingDoctor's name if present.
            Respond with ONLY valid JSON in this exact shape:
            {
              "prescribingDoctor": "string or null",
              "medications": [
                { "medicationName": "string", "dosage": "string or null", "frequency": "string or null", "duration": "string or null" }
              ]
            }
            Do not include any markdown fences or commentary.
            ---BEGIN REPORT TEXT---
            %s
            ---END REPORT TEXT---
            """;

    private final LlamaClient llamaClient;
    private final ObjectMapper objectMapper;
    private final PrescriptionRepository prescriptions;

    public PrescriptionProcessor(LlamaClient llamaClient, ObjectMapper objectMapper, PrescriptionRepository prescriptions) {
        this.llamaClient = llamaClient;
        this.objectMapper = objectMapper;
        this.prescriptions = prescriptions;
    }

    @Override
    public boolean supports(DocumentType type) {
        return type == DocumentType.PRESCRIPTION;
    }

    @Override
    public AiInsight process(MedicalDocument document, String extractedText) {
        // Chunking utility should be used here, but for simplicity we will just truncate text for non-lab docs
        // or let's use the shared chunking utility if we had one. The user said:
        // "We will create a separate chunking utility exclusively for the new processors to use."
        // I will implement a quick truncate for now, or just send the first 10000 chars.
        String safeText = extractedText.length() > 8000 ? extractedText.substring(0, 8000) : extractedText;
        String response = llamaClient.chat(String.format(PROMPT, safeText), "", 2000);
        
        String json = recoverJson(response);
        
        List<Prescription> saved = new ArrayList<>();
        String doctor = null;
        try {
            JsonNode root = objectMapper.readTree(json);
            doctor = root.has("prescribingDoctor") && !root.get("prescribingDoctor").isNull() ? root.get("prescribingDoctor").asText() : null;
            
            for (JsonNode med : root.withArray("medications")) {
                if (!med.has("medicationName") || med.get("medicationName").isNull()) continue;
                
                try {
                    String validName = DataValidator.validatePrimaryString(med.get("medicationName").asText(), "medicationName");
                    
                    Prescription p = new Prescription();
                    p.document = document;
                    p.familyMember = document.familyMember;
                    p.medicationName = validName;
                    p.dosage = DataValidator.validateSecondaryString(textOrNull(med, "dosage"), "dosage");
                    p.frequency = DataValidator.validateSecondaryString(textOrNull(med, "frequency"), "frequency");
                    p.duration = DataValidator.validateSecondaryString(textOrNull(med, "duration"), "duration");
                    p.prescribingDoctor = DataValidator.validateSecondaryString(doctor, "prescribingDoctor");
                    
                    saved.add(prescriptions.save(p));
                } catch (ExtractionValidationException e) {
                    log.warn("Skipping medication due to validation error: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse prescription JSON: {}", response, e);
            throw new RuntimeException("Failed to parse prescription JSON", e);
        }

        AiInsight insight = new AiInsight();
        insight.document = document;
        insight.familyMember = document.familyMember;
        insight.summaryText = String.format("Prescription for %d medications%s.", 
                saved.size(), doctor != null ? " prescribed by " + doctor : "");
        insight.comparisonJson = "{}";
        insight.modelUsed = llamaClient.modelName();
        return insight;
    }
    
    private String textOrNull(JsonNode node, String field) {
        if (!node.has(field) || node.get(field).isNull()) return null;
        return node.get(field).asText();
    }
    
    private String recoverJson(String response) {
        String trimmed = response == null ? "" : response.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?", "").replaceFirst("```$", "").trim();
        }
        if (trimmed.startsWith("{")) {
            return trimmed;
        }
        var matcher = Pattern.compile("\\{[\\s\\S]*}").matcher(trimmed);
        if (matcher.find()) {
            return matcher.group();
        }
        return "{}";
    }
}
