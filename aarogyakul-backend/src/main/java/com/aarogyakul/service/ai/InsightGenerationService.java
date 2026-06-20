package com.aarogyakul.service.ai;

import com.aarogyakul.dto.Dtos.ComparisonData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InsightGenerationService {
    private static final String SUMMARY_PROMPT = """
            You are a friendly medical assistant explaining lab results to someone with no medical background. You will be given a JSON object describing one or more lab parameters, their current value, and (if available) their previous value and percent change. Write a short, warm, plain-English summary (2-4 sentences) of what changed and whether it's worth mentioning to a doctor. Do not give a diagnosis. Do not use medical jargon without explaining it in the same sentence. If there is no previous value to compare against, just state the current value and whether it falls within the normal range.
            """;

    private final LlamaClient llamaClient;
    private final ObjectMapper objectMapper;

    public InsightGenerationService(LlamaClient llamaClient, ObjectMapper objectMapper) {
        this.llamaClient = llamaClient;
        this.objectMapper = objectMapper;
    }

    public String generate(List<ComparisonData> comparisons) {
        try {
            String json = objectMapper.writeValueAsString(comparisons);
            return llamaClient.chat(SUMMARY_PROMPT, json, 600).trim();
        } catch (Exception e) {
            return fallbackSummary(comparisons);
        }
    }

    private String fallbackSummary(List<ComparisonData> comparisons) {
        if (comparisons.isEmpty()) {
            return "No lab parameters could be extracted confidently from this report.";
        }
        var first = comparisons.getFirst();
        if (first.previousValue() == null) {
            return "I extracted %d lab parameter(s) from this report. This is the first stored result for %s, so future reports can be compared against it.".formatted(comparisons.size(), first.parameterName());
        }
        return "%s changed from %s to %s. Consider discussing notable changes with your doctor, especially if this differs from your usual range."
                .formatted(first.parameterName(), first.previousValue(), first.currentValue());
    }
}
