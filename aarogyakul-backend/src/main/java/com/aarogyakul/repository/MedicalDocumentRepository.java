package com.aarogyakul.repository;

import com.aarogyakul.entity.MedicalDocument;
import com.aarogyakul.util.Enums.ProcessingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, UUID> {
    List<MedicalDocument> findByFamilyMemberIdOrderByUploadedAtDesc(UUID familyMemberId);
    Page<MedicalDocument> findByFamilyMemberId(UUID familyMemberId, Pageable pageable);
    Optional<MedicalDocument> findByIdAndFamilyMemberFamilyOwnerId(UUID id, UUID ownerId);
    List<MedicalDocument> findByProcessingStatusAndUpdatedAtBefore(ProcessingStatus status, Instant cutoff);
    List<MedicalDocument> findByProcessingStatusAndRetryCountLessThanAndUpdatedAtBefore(
            ProcessingStatus status, int maxRetries, Instant cutoff);
}
