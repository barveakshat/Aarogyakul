package com.aarogyakul.service;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.FamilyMember;
import com.aarogyakul.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class AllergyRepositoryFacade {
    private final AllergyRepository allergies;
    private final ChronicConditionRepository conditions;
    private final Mapper mapper;

    public AllergyRepositoryFacade(AllergyRepository allergies, ChronicConditionRepository conditions, @Lazy Mapper mapper) {
        this.allergies = allergies;
        this.conditions = conditions;
        this.mapper = mapper;
    }

    List<AllergyResponse> allergies(FamilyMember member) {
        return allergies.findByFamilyMemberId(member.id).stream().map(mapper::allergy).toList();
    }

    List<ChronicConditionResponse> conditions(FamilyMember member) {
        return conditions.findByFamilyMemberId(member.id).stream().map(mapper::condition).toList();
    }
}
