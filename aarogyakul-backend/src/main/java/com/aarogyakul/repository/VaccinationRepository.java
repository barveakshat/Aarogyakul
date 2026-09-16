package com.aarogyakul.repository;

import com.aarogyakul.entity.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface VaccinationRepository extends JpaRepository<Vaccination, UUID> {
    List<Vaccination> findByDocumentId(UUID documentId);
    List<Vaccination> findByFamilyMemberId(UUID familyMemberId);
}
