package com.aarogyakul.repository;

import com.aarogyakul.entity.ChronicCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ChronicConditionRepository extends JpaRepository<ChronicCondition, UUID> {
    List<ChronicCondition> findByFamilyMemberId(UUID familyMemberId);
}
