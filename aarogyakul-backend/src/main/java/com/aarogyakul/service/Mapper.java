package com.aarogyakul.service;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
public class Mapper {
    private final AllergyRepositoryFacade allergyFacade;
    private final ObjectMapper objectMapper;
    private final StorageService storage;

    public Mapper(AllergyRepositoryFacade allergyFacade, ObjectMapper objectMapper, StorageService storage) {
        this.allergyFacade = allergyFacade;
        this.objectMapper = objectMapper;
        this.storage = storage;
    }

    public FamilyResponse family(Family family, List<MemberResponse> members) {
        return new FamilyResponse(family.id, family.familyName, family.owner.id, family.createdAt, members);
    }

    public MemberResponse member(FamilyMember member) {
        return new MemberResponse(member.id, member.family.id, member.fullName, member.dateOfBirth,
                member.gender, member.bloodGroup, member.relationshipToOwner, resolvePhotoUrl(member.profilePhotoUrl),
                allergyFacade.allergies(member), allergyFacade.conditions(member));
    }

    private String resolvePhotoUrl(String key) {
        return resolveUrl(key);
    }

    private String resolveUrl(String key) {
        if (key == null || key.isBlank() || "pending".equals(key)) return null;
        return storage.presignedUrl(key, Duration.ofHours(1));
    }

    public AllergyResponse allergy(Allergy allergy) {
        return new AllergyResponse(allergy.id, allergy.allergen, allergy.severity, allergy.notes);
    }

    public ChronicConditionResponse condition(ChronicCondition condition) {
        return new ChronicConditionResponse(condition.id, condition.conditionName, condition.diagnosedDate, condition.notes);
    }

    public ParameterResponse parameter(MedicalParameter p) {
        return new ParameterResponse(p.parameterName, p.value, p.unit, p.referenceRangeLow, p.referenceRangeHigh, p.confidence);
    }

    public DocumentSummaryResponse documentSummary(MedicalDocument d) {
        return new DocumentSummaryResponse(d.id, d.fileName, d.documentType, d.processingStatus, d.reportDate, d.uploadedAt,
                resolveUrl(d.fileUrl), resolveUrl(d.thumbnailUrl), d.fileSizeBytes);
    }

    public PrescriptionResponse prescription(Prescription p) {
        return new PrescriptionResponse(p.id, p.medicationName, p.dosage, p.frequency, p.duration, p.prescribingDoctor);
    }
    
    public VaccinationResponse vaccination(Vaccination v) {
        return new VaccinationResponse(v.id, v.vaccineName, v.doseNumber, v.dateAdministered, v.administeredBy);
    }
    
    public MedicalBillResponse medicalBill(MedicalBill b) {
        return new MedicalBillResponse(b.id, b.providerName, b.totalAmount, b.dateOfService);
    }

    public DocumentResponse documentResponse(MedicalDocument d, List<ParameterResponse> parameters, 
                                             List<PrescriptionResponse> prescriptions,
                                             List<VaccinationResponse> vaccinations,
                                             List<MedicalBillResponse> medicalBills,
                                             Map<String, Object> extractedMetadata,
                                             InsightResponse insight) {
        return new DocumentResponse(d.id, d.fileName, d.documentType, d.processingStatus, d.reportDate, d.processingError,
                parameters, prescriptions, vaccinations, medicalBills, extractedMetadata, insight, 
                d.uploadedAt, resolveUrl(d.fileUrl), resolveUrl(d.thumbnailUrl), d.fileSizeBytes);
    }

    public InsightResponse insight(AiInsight insight) {
        Map<String, Object> json = Map.of();
        if (insight.comparisonJson != null && !insight.comparisonJson.isBlank()) {
            try {
                json = objectMapper.readValue(insight.comparisonJson, new TypeReference<>() {});
            } catch (Exception ignored) {
                json = Map.of("raw", insight.comparisonJson);
            }
        }
        return new InsightResponse(insight.summaryText, json);
    }
}
