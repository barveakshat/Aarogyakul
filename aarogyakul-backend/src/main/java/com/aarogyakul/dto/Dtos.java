package com.aarogyakul.dto;

import com.aarogyakul.util.Enums.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class Dtos {
    private Dtos() {}

    public record RegisterRequest(@Email @NotBlank String email, @Size(min = 8) String password,
                                  @NotBlank String fullName, String phoneNumber) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record AuthResponse(UUID userId, String email, String fullName, String accessToken) {}

    public record CreateFamilyRequest(@NotBlank String familyName) {}
    public record FamilyResponse(UUID familyId, String familyName, UUID ownerId, OffsetDateTime createdAt,
                                 List<MemberResponse> members) {}

    public record MemberRequest(@NotBlank String fullName, LocalDate dateOfBirth, String gender,
                                String bloodGroup, String relationshipToOwner, String profilePhotoUrl) {}
    public record MemberResponse(UUID memberId, UUID familyId, String fullName, LocalDate dateOfBirth,
                                 String gender, String bloodGroup, String relationshipToOwner,
                                 String profilePhotoUrl, List<AllergyResponse> allergies,
                                 List<ChronicConditionResponse> chronicConditions) {}

    public record AllergyRequest(@NotBlank String allergen, String severity, String notes) {}
    public record AllergyResponse(UUID id, String allergen, String severity, String notes) {}

    public record ChronicConditionRequest(@NotBlank String conditionName, LocalDate diagnosedDate, String notes) {}
    public record ChronicConditionResponse(UUID id, String conditionName, LocalDate diagnosedDate, String notes) {}

    public record DocumentUploadResponse(UUID documentId, String fileName, DocumentType documentType,
                                         ProcessingStatus processingStatus, OffsetDateTime uploadedAt) {}
    public record DocumentSummaryResponse(UUID documentId, String fileName, DocumentType documentType,
                                          ProcessingStatus processingStatus, LocalDate reportDate,
                                          OffsetDateTime uploadedAt) {}
    public record DocumentResponse(UUID documentId, String fileName, DocumentType documentType,
                                   ProcessingStatus processingStatus, LocalDate reportDate,
                                   String processingError, List<ParameterResponse> parameters,
                                   InsightResponse insight, OffsetDateTime uploadedAt) {}
    public record ParameterResponse(String parameterName, BigDecimal value, String unit,
                                    BigDecimal referenceRangeLow, BigDecimal referenceRangeHigh) {}
    public record InsightResponse(String summaryText, Map<String, Object> comparisonJson) {}
    public record TimelineEventResponse(UUID id, TimelineEventType eventType, LocalDate eventDate,
                                        String title, String description, UUID relatedDocumentId,
                                        boolean isManual) {}

    public record TimelineEventRequest(@NotBlank String title, @NotNull TimelineEventType eventType,
                                       @NotNull LocalDate eventDate, String description) {}

    public record ExtractedReport(LocalDate reportDate, List<ExtractedParameter> parameters) {}
    public record ExtractedParameter(String name, BigDecimal value, String unit,
                                     BigDecimal referenceRangeLow, BigDecimal referenceRangeHigh) {}
    public record ComparisonData(String parameterName, BigDecimal previousValue, BigDecimal currentValue,
                                 BigDecimal absoluteChange, Double percentChange, TrendDirection trend,
                                 String unit, BigDecimal referenceRangeLow, BigDecimal referenceRangeHigh) {}
}
