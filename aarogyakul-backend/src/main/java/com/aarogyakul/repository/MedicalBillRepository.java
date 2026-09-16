package com.aarogyakul.repository;

import com.aarogyakul.entity.MedicalBill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MedicalBillRepository extends JpaRepository<MedicalBill, UUID> {
    List<MedicalBill> findByDocumentId(UUID documentId);
    List<MedicalBill> findByFamilyMemberId(UUID familyMemberId);
}
