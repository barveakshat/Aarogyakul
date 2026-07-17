package com.aarogyakul.service.ai;

/**
 * Represents a processing stage update for a document.
 * Published as a Spring application event during the AI pipeline.
 */
public record ProcessingStageEvent(
        java.util.UUID documentId,
        String stage,
        String message
) {
    public static final String EXTRACTING_TEXT = "EXTRACTING_TEXT";
    public static final String IDENTIFYING_PARAMETERS = "IDENTIFYING_PARAMETERS";
    public static final String COMPARING_HISTORY = "COMPARING_HISTORY";
    public static final String GENERATING_SUMMARY = "GENERATING_SUMMARY";
    public static final String COMPLETED = "COMPLETED";
    public static final String FAILED = "FAILED";
}
