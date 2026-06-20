package com.aarogyakul.repository;

import com.aarogyakul.entity.MedicalParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicalParameterRepository extends JpaRepository<MedicalParameter, UUID> {
    List<MedicalParameter> findByDocumentIdOrderByParameterNameAsc(UUID documentId);
    void deleteByDocumentId(UUID documentId);

    Optional<MedicalParameter> findFirstByFamilyMemberIdAndParameterNameAndReportDateBeforeOrderByReportDateDescCreatedAtDesc(
            UUID memberId, String parameterName, LocalDate reportDate);
}
