package com.aarogyakul.service.ai;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.exception.ApiException;
import com.aarogyakul.util.ParameterUtils;
import com.fasterxml.jackson.databind.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ParameterExtractionService {
    static final String EXTRACTION_PROMPT = """
            You are a medical document parser. You will be given raw text extracted from a blood test report. Extract every lab parameter you can find into a JSON array. For each parameter, include: name (the parameter name as written, e.g. "HbA1c", "Total Cholesterol", "Vitamin D"), value (numeric only, no units), unit (e.g. "%", "mg/dL"), referenceRangeLow and referenceRangeHigh (numeric, null if not stated). Also extract the report date if present, in YYYY-MM-DD format.

            Respond with ONLY valid JSON in this exact shape, no markdown fences, no commentary:
            {
              "reportDate": "YYYY-MM-DD or null",
              "parameters": [
                { "name": "string", "value": number, "unit": "string or null", "referenceRangeLow": number or null, "referenceRangeHigh": number or null }
              ]
            }

            If you cannot confidently extract a value, omit that parameter rather than guessing.
            """;

    private static final Pattern JSON_OBJECT = Pattern.compile("\\{[\\s\\S]*}");
    private final LlamaClient llamaClient;
    private final ObjectMapper objectMapper;

    public ParameterExtractionService(LlamaClient llamaClient, ObjectMapper objectMapper) {
        this.llamaClient = llamaClient;
        this.objectMapper = objectMapper;
    }

    public ExtractedReport extract(String reportText) {
        String response = llamaClient.chat(EXTRACTION_PROMPT, reportText, 2000);
        return parseResponse(response);
    }

    ExtractedReport parseResponse(String response) {
        try {
            String json = recoverJson(response);
            JsonNode root = objectMapper.readTree(json);
            LocalDate reportDate = null;
            JsonNode dateNode = root.get("reportDate");
            if (dateNode != null && !dateNode.isNull() && !"null".equalsIgnoreCase(dateNode.asText())) {
                reportDate = LocalDate.parse(dateNode.asText());
            }
            List<ExtractedParameter> params = new ArrayList<>();
            for (JsonNode node : root.withArray("parameters")) {
                if (node.get("name") == null || node.get("value") == null || node.get("value").isNull()) {
                    continue;
                }
                params.add(new ExtractedParameter(
                        ParameterUtils.canonicalize(node.get("name").asText()),
                        node.get("value").decimalValue(),
                        nullableText(node.get("unit")),
                        decimalOrNull(node.get("referenceRangeLow")),
                        decimalOrNull(node.get("referenceRangeHigh"))
                ));
            }
            return new ExtractedReport(reportDate, params);
        } catch (Exception e) {
            throw ApiException.processing("Could not parse extracted lab parameters");
        }
    }

    private String recoverJson(String response) {
        String trimmed = Optional.ofNullable(response).orElse("").trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?", "").replaceFirst("```$", "").trim();
        }
        if (trimmed.startsWith("{")) {
            return trimmed;
        }
        var matcher = JSON_OBJECT.matcher(trimmed);
        if (matcher.find()) {
            return matcher.group();
        }
        throw ApiException.processing("Llama response did not contain JSON");
    }

    private String nullableText(JsonNode node) {
        return node == null || node.isNull() || "null".equalsIgnoreCase(node.asText()) ? null : node.asText();
    }

    private java.math.BigDecimal decimalOrNull(JsonNode node) {
        return node == null || node.isNull() ? null : node.decimalValue();
    }
}
