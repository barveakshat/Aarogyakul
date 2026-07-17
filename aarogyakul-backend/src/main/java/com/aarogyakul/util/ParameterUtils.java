package com.aarogyakul.util;

import java.math.BigDecimal;
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

    /**
     * Physiological sanity bounds for common lab parameters.
     * Values outside these ranges are almost certainly hallucinated by the LLM
     * or OCR misreads. Array format: [min, max].
     */
    private static final Map<String, double[]> SANITY_BOUNDS = Map.ofEntries(
            Map.entry("HbA1c",                    new double[]{2.0,   20.0}),
            Map.entry("Hemoglobin",               new double[]{2.0,   25.0}),
            Map.entry("TSH",                      new double[]{0.001, 100.0}),
            Map.entry("Total Cholesterol",        new double[]{50.0,  500.0}),
            Map.entry("LDL",                      new double[]{20.0,  400.0}),
            Map.entry("HDL",                      new double[]{5.0,   150.0}),
            Map.entry("Triglycerides",            new double[]{20.0,  1000.0}),
            Map.entry("Blood Glucose (Fasting)",  new double[]{30.0,  600.0}),
            Map.entry("Creatinine",               new double[]{0.1,   20.0}),
            Map.entry("Vitamin D",                new double[]{1.0,   200.0}),
            Map.entry("Platelet Count",           new double[]{10.0,  2000.0}),
            Map.entry("WBC",                      new double[]{0.5,   100.0})
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

    /**
     * Assesses confidence in an extracted parameter value based on sanity bounds.
     * HIGH = value within known physiological bounds for this parameter.
     * MEDIUM = parameter not in the sanity bounds map (unknown range).
     * LOW = value outside physiological bounds — likely hallucinated or OCR error.
     */
    public static Enums.ConfidenceLevel assessConfidence(String canonicalName, BigDecimal value) {
        if (value == null) return Enums.ConfidenceLevel.MEDIUM;
        double[] bounds = SANITY_BOUNDS.get(canonicalName);
        if (bounds == null) return Enums.ConfidenceLevel.MEDIUM;
        double v = value.doubleValue();
        if (v < bounds[0] || v > bounds[1]) return Enums.ConfidenceLevel.LOW;
        return Enums.ConfidenceLevel.HIGH;
    }
}
