package com.aarogyakul.repository;

import com.aarogyakul.entity.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AllergyRepository extends JpaRepository<Allergy, UUID> {
    List<Allergy> findByFamilyMemberId(UUID familyMemberId);
}
