package com.aarogyakul.service.ai;

import com.aarogyakul.entity.AiInsight;
import com.aarogyakul.entity.MedicalDocument;
import com.aarogyakul.entity.Vaccination;
import com.aarogyakul.repository.VaccinationRepository;
import com.aarogyakul.util.Enums.DocumentType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class VaccinationProcessor implements DocumentCategoryProcessor {
    private static final Logger log = LoggerFactory.getLogger(VaccinationProcessor.class);

    private static final String PROMPT = """
            You are a medical document parser. Extract vaccination details from the text below.
            Identify all administered vaccines. For each, extract: vaccineName, doseNumber, dateAdministered (YYYY-MM-DD), and administeredBy.
            Respond with ONLY valid JSON in this exact shape:
            {
              "vaccines": [
                { "vaccineName": "string", "doseNumber": "string or null", "dateAdministered": "YYYY-MM-DD or null", "administeredBy": "string or null" }
              ]
            }
            Do not include any markdown fences or commentary.
            ---BEGIN REPORT TEXT---
            %s
            ---END REPORT TEXT---
            """;

    private final LlamaClient llamaClient;
    private final ObjectMapper objectMapper;
    private final VaccinationRepository vaccinations;

    public VaccinationProcessor(LlamaClient llamaClient, ObjectMapper objectMapper, VaccinationRepository vaccinations) {
        this.llamaClient = llamaClient;
        this.objectMapper = objectMapper;
        this.vaccinations = vaccinations;
    }

    @Override
    public boolean supports(DocumentType type) {
        return type == DocumentType.VACCINATION;
    }

    @Override
    public AiInsight process(MedicalDocument document, String extractedText) {
        String safeText = extractedText.length() > 8000 ? extractedText.substring(0, 8000) : extractedText;
        String response = llamaClient.chat(String.format(PROMPT, safeText), "", 2000);
        String json = recoverJson(response);
        
        List<Vaccination> saved = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            for (JsonNode vac : root.withArray("vaccines")) {
                if (!vac.has("vaccineName") || vac.get("vaccineName").isNull()) continue;
                
                try {
                    String validName = DataValidator.validatePrimaryString(vac.get("vaccineName").asText(), "vaccineName");
                    
                    Vaccination v = new Vaccination();
                    v.document = document;
                    v.familyMember = document.familyMember;
                    v.vaccineName = validName;
                    v.doseNumber = DataValidator.validateSecondaryString(textOrNull(vac, "doseNumber"), "doseNumber");
                    v.administeredBy = DataValidator.validateSecondaryString(textOrNull(vac, "administeredBy"), "administeredBy");
                    
                    String dateStr = textOrNull(vac, "dateAdministered");
                    if (dateStr != null) {
                        try {
                            v.dateAdministered = DataValidator.validateDate(LocalDate.parse(dateStr), "dateAdministered");
                        } catch (Exception e) {
                            log.warn("Invalid date format: {}", dateStr);
                        }
                    }
                    
                    saved.add(vaccinations.save(v));
                } catch (ExtractionValidationException e) {
                    log.warn("Skipping vaccine due to validation error: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse vaccination JSON: {}", response, e);
            throw new RuntimeException("Failed to parse vaccination JSON", e);
        }

        AiInsight insight = new AiInsight();
        insight.document = document;
        insight.familyMember = document.familyMember;
        insight.summaryText = String.format("Vaccination certificate for %d vaccines.", saved.size());
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
