package com.aarogyakul.service.ai;

import com.aarogyakul.entity.AiInsight;
import com.aarogyakul.entity.MedicalDocument;
import com.aarogyakul.util.Enums.DocumentType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Pattern;

@Component
public class GenericDocumentProcessor implements DocumentCategoryProcessor {
    private static final Logger log = LoggerFactory.getLogger(GenericDocumentProcessor.class);

    private static final String PROMPT = """
            You are a medical document parser. Read the following medical document text.
            Provide a short 2-3 sentence summary of the document's contents.
            Also extract any key entities (e.g. diagnoses, notable instructions) into a simple key-value map.
            Respond with ONLY valid JSON in this exact shape:
            {
              "summary": "string",
              "metadata": { "key1": "value1", "key2": "value2" }
            }
            Do not include any markdown fences or commentary.
            ---BEGIN REPORT TEXT---
            %s
            ---END REPORT TEXT---
            """;

    private final LlamaClient llamaClient;
    private final ObjectMapper objectMapper;

    public GenericDocumentProcessor(LlamaClient llamaClient, ObjectMapper objectMapper) {
        this.llamaClient = llamaClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean supports(DocumentType type) {
        return type == DocumentType.OTHER || type == DocumentType.DISCHARGE_SUMMARY || type == DocumentType.INSURANCE_DOC || type == DocumentType.MEDICAL_ID;
    }

    @Override
    public AiInsight process(MedicalDocument document, String extractedText) {
        String safeText = extractedText.length() > 8000 ? extractedText.substring(0, 8000) : extractedText;
        String response = llamaClient.chat(String.format(PROMPT, safeText), "", 2000);
        String json = recoverJson(response);
        
        String summary = "Unable to generate summary.";
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.has("summary") && !root.get("summary").isNull()) {
                summary = root.get("summary").asText();
            }
            if (root.has("metadata") && !root.get("metadata").isNull()) {
                String metadataStr = root.get("metadata").toString();
                // Ensure the JSON string isn't excessively large
                if (metadataStr.length() > 10000) {
                    log.warn("Extracted metadata exceeds 10KB. Truncating.");
                    document.extractedMetadata = "{\"error\": \"Metadata too large\"}";
                } else {
                    document.extractedMetadata = metadataStr;
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse generic document JSON: {}", response, e);
            document.extractedMetadata = "{}";
        }

        AiInsight insight = new AiInsight();
        insight.document = document;
        insight.familyMember = document.familyMember;
        insight.summaryText = summary;
        insight.comparisonJson = "{}";
        insight.modelUsed = llamaClient.modelName();
        return insight;
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
