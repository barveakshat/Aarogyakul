package com.aarogyakul.service.ai;

import com.aarogyakul.entity.AiInsight;
import com.aarogyakul.entity.MedicalBill;
import com.aarogyakul.entity.MedicalDocument;
import com.aarogyakul.repository.MedicalBillRepository;
import com.aarogyakul.util.Enums.DocumentType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class MedicalBillProcessor implements DocumentCategoryProcessor {
    private static final Logger log = LoggerFactory.getLogger(MedicalBillProcessor.class);

    private static final String PROMPT = """
            You are a medical document parser. Extract bill/invoice details from the text below.
            Identify all provider charges. For each distinct bill or charge, extract: providerName, totalAmount, and dateOfService (YYYY-MM-DD).
            Respond with ONLY valid JSON in this exact shape:
            {
              "bills": [
                { "providerName": "string", "totalAmount": number or null, "dateOfService": "YYYY-MM-DD or null" }
              ]
            }
            Do not include any markdown fences or commentary.
            ---BEGIN REPORT TEXT---
            %s
            ---END REPORT TEXT---
            """;

    private final LlamaClient llamaClient;
    private final ObjectMapper objectMapper;
    private final MedicalBillRepository medicalBills;

    public MedicalBillProcessor(LlamaClient llamaClient, ObjectMapper objectMapper, MedicalBillRepository medicalBills) {
        this.llamaClient = llamaClient;
        this.objectMapper = objectMapper;
        this.medicalBills = medicalBills;
    }

    @Override
    public boolean supports(DocumentType type) {
        return type == DocumentType.BILL;
    }

    @Override
    public AiInsight process(MedicalDocument document, String extractedText) {
        String safeText = extractedText.length() > 8000 ? extractedText.substring(0, 8000) : extractedText;
        String response = llamaClient.chat(String.format(PROMPT, safeText), "", 2000);
        String json = recoverJson(response);
        
        List<MedicalBill> saved = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            for (JsonNode bill : root.withArray("bills")) {
                if (!bill.has("providerName") || bill.get("providerName").isNull()) continue;
                
                try {
                    String validName = DataValidator.validatePrimaryString(bill.get("providerName").asText(), "providerName");
                    
                    MedicalBill b = new MedicalBill();
                    b.document = document;
                    b.familyMember = document.familyMember;
                    b.providerName = validName;
                    
                    if (bill.has("totalAmount") && bill.get("totalAmount").isNumber()) {
                        b.totalAmount = DataValidator.validateNumeric12_2(bill.get("totalAmount").decimalValue(), "totalAmount");
                    }
                    
                    String dateStr = textOrNull(bill, "dateOfService");
                    if (dateStr != null) {
                        try {
                            b.dateOfService = DataValidator.validateDate(LocalDate.parse(dateStr), "dateOfService");
                        } catch (Exception e) {
                            log.warn("Invalid date format: {}", dateStr);
                        }
                    }
                    
                    saved.add(medicalBills.save(b));
                } catch (ExtractionValidationException e) {
                    log.warn("Skipping bill due to validation error: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse medical bill JSON: {}", response, e);
            throw new RuntimeException("Failed to parse medical bill JSON", e);
        }

        BigDecimal total = saved.stream()
                .filter(b -> b.totalAmount != null)
                .map(b -> b.totalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        AiInsight insight = new AiInsight();
        insight.document = document;
        insight.familyMember = document.familyMember;
        insight.summaryText = String.format("Medical bill from %s%s.", 
                saved.isEmpty() ? "Unknown Provider" : saved.get(0).providerName,
                total.compareTo(BigDecimal.ZERO) > 0 ? " for ₹" + total.toPlainString() : "");
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
