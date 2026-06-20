package com.aarogyakul.service;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
public class Mapper {
    private final AllergyRepositoryFacade allergyFacade;
    private final ObjectMapper objectMapper;

    public Mapper(AllergyRepositoryFacade allergyFacade, ObjectMapper objectMapper) {
        this.allergyFacade = allergyFacade;
        this.objectMapper = objectMapper;
    }

    public FamilyResponse family(Family family, List<MemberResponse> members) {
        return new FamilyResponse(family.id, family.familyName, family.owner.id, family.createdAt, members);
    }

    public MemberResponse member(FamilyMember member) {
        return new MemberResponse(member.id, member.family.id, member.fullName, member.dateOfBirth,
                member.gender, member.bloodGroup, member.relationshipToOwner, member.profilePhotoUrl,
                allergyFacade.allergies(member), allergyFacade.conditions(member));
    }

    public AllergyResponse allergy(Allergy allergy) {
        return new AllergyResponse(allergy.id, allergy.allergen, allergy.severity, allergy.notes);
    }

    public ChronicConditionResponse condition(ChronicCondition condition) {
        return new ChronicConditionResponse(condition.id, condition.conditionName, condition.diagnosedDate, condition.notes);
    }

    public ParameterResponse parameter(MedicalParameter p) {
        return new ParameterResponse(p.parameterName, p.value, p.unit, p.referenceRangeLow, p.referenceRangeHigh);
    }

    public DocumentSummaryResponse documentSummary(MedicalDocument d) {
        return new DocumentSummaryResponse(d.id, d.fileName, d.documentType, d.processingStatus, d.reportDate, d.uploadedAt);
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
