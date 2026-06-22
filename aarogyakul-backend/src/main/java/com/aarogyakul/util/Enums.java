package com.aarogyakul.util;

public final class Enums {
    private Enums() {}

    public enum DocumentType { BLOOD_REPORT, PRESCRIPTION, DISCHARGE_SUMMARY, OTHER, LAB_REPORT, BILL, INSURANCE_DOC, MEDICAL_ID }
    public enum ProcessingStatus { PENDING, PROCESSING, COMPLETED, FAILED }
    public enum TimelineEventType { DOCUMENT_UPLOAD, DIAGNOSIS, VACCINATION, DOCTOR_VISIT, SURGERY, LAB_TEST, MEDICATION_CHANGE, NOTE }
    public enum TrendDirection { IMPROVING, WORSENING, STABLE, UNKNOWN }
}
