package com.aarogyakul.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.math.BigDecimal;
import java.time.LocalDate;

public final class DataValidator {
    private static final Logger log = LoggerFactory.getLogger(DataValidator.class);
    private static final int MAX_VARCHAR = 255;
    
    private DataValidator() {}

    /**
     * Validates a primary identifying field (e.g., medication name, provider name).
     * If invalid or missing, throws ExtractionValidationException, which causes the entire row to be discarded.
     */
    public static String validatePrimaryString(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ExtractionValidationException("Primary field '" + fieldName + "' is missing or empty.");
        }
        if (value.length() > MAX_VARCHAR) {
            log.warn("Truncating primary field '{}' from {} chars to {}", fieldName, value.length(), MAX_VARCHAR);
            return value.substring(0, MAX_VARCHAR);
        }
        return value;
    }
    
    /**
     * Validates a secondary string field. If invalid, gracefully degrades to null.
     */
    public static String validateSecondaryString(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            return null;
        }
        if (value.length() > MAX_VARCHAR) {
            log.warn("Truncating secondary field '{}' from {} chars to {}", fieldName, value.length(), MAX_VARCHAR);
            return value.substring(0, MAX_VARCHAR);
        }
        return value;
    }

    /**
     * Validates a secondary numeric field for NUMERIC(10,3) columns.
     */
    public static BigDecimal validateNumeric10_3(BigDecimal value, String fieldName) {
        if (value == null) return null;
        if (value.compareTo(new BigDecimal("9999999.999")) > 0 || value.compareTo(new BigDecimal("-9999999.999")) < 0) {
            log.warn("Secondary numeric field '{}' exceeded NUMERIC(10,3) bounds: {}. Degrading to null.", fieldName, value);
            return null;
        }
        return value;
    }

    /**
     * Validates a secondary numeric field for NUMERIC(12,2) columns (e.g. amounts).
     */
    public static BigDecimal validateNumeric12_2(BigDecimal value, String fieldName) {
        if (value == null) return null;
        if (value.compareTo(new BigDecimal("9999999999.99")) > 0 || value.compareTo(new BigDecimal("-9999999999.99")) < 0) {
            log.warn("Secondary numeric field '{}' exceeded NUMERIC(12,2) bounds: {}. Degrading to null.", fieldName, value);
            return null;
        }
        return value;
    }

    /**
     * Validates a secondary date field.
     */
    public static LocalDate validateDate(LocalDate date, String fieldName) {
        if (date == null) return null;
        if (date.getYear() < 1900 || date.getYear() > 2100) {
            log.warn("Secondary date field '{}' has implausible value: {}. Degrading to null.", fieldName, date);
            return null;
        }
        return date;
    }
}
