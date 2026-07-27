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

    /** All readings of a specific parameter for a member, oldest first. */
    List<MedicalParameter> findByFamilyMemberIdAndParameterNameOrderByReportDateAsc(
            UUID memberId, String parameterName);

    /** Distinct parameter names that have been tracked for a member. */
    @Query("SELECT DISTINCT p.parameterName FROM MedicalParameter p WHERE p.familyMember.id = :memberId ORDER BY p.parameterName")
    List<String> findDistinctParameterNamesByFamilyMemberId(@Param("memberId") UUID memberId);
}
