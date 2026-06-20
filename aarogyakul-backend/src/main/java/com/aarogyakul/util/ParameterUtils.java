package com.aarogyakul.util;

import java.util.Locale;
import java.util.Map;

public final class ParameterUtils {
    private static final Map<String, String> SYNONYMS = Map.ofEntries(
            Map.entry("hba1c", "HbA1c"),
            Map.entry("hb a1c", "HbA1c"),
            Map.entry("hemoglobin a1c", "HbA1c"),
            Map.entry("glycated hemoglobin", "HbA1c"),
            Map.entry("total cholesterol", "Total Cholesterol"),
            Map.entry("cholesterol total", "Total Cholesterol"),
            Map.entry("ldl", "LDL"),
            Map.entry("ldl cholesterol", "LDL"),
            Map.entry("hdl", "HDL"),
            Map.entry("hdl cholesterol", "HDL"),
            Map.entry("triglycerides", "Triglycerides"),
            Map.entry("vitamin d", "Vitamin D"),
            Map.entry("25-hydroxy vitamin d", "Vitamin D"),
            Map.entry("25 oh vitamin d", "Vitamin D"),
            Map.entry("hemoglobin", "Hemoglobin"),
            Map.entry("haemoglobin", "Hemoglobin"),
            Map.entry("hb", "Hemoglobin"),
            Map.entry("blood glucose fasting", "Blood Glucose (Fasting)"),
            Map.entry("fasting blood glucose", "Blood Glucose (Fasting)"),
            Map.entry("glucose fasting", "Blood Glucose (Fasting)"),
            Map.entry("fbs", "Blood Glucose (Fasting)"),
            Map.entry("creatinine", "Creatinine"),
            Map.entry("serum creatinine", "Creatinine"),
            Map.entry("tsh", "TSH"),
            Map.entry("thyroid stimulating hormone", "TSH")
    );

    private ParameterUtils() {}

    public static String canonicalize(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        String normalized = value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9%() ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        return SYNONYMS.getOrDefault(normalized, value.trim());
    }
}
