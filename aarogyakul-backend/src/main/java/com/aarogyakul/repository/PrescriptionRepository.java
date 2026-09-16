package com.aarogyakul.repository;

import com.aarogyakul.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    List<Prescription> findByDocumentId(UUID documentId);
    List<Prescription> findByFamilyMemberId(UUID familyMemberId);
}
