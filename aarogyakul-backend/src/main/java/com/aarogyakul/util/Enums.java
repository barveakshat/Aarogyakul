package com.aarogyakul.util;

public final class Enums {
    private Enums() {}

    public enum DocumentType { BLOOD_REPORT, PRESCRIPTION, DISCHARGE_SUMMARY, OTHER }
    public enum ProcessingStatus { PENDING, PROCESSING, COMPLETED, FAILED }
    public enum TimelineEventType { DOCUMENT_UPLOAD, DIAGNOSIS, VACCINATION, DOCTOR_VISIT, SURGERY }
    public enum TrendDirection { IMPROVING, WORSENING, STABLE, UNKNOWN }
}
