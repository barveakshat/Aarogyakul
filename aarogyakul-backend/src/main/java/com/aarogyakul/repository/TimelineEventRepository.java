package com.aarogyakul.repository;

import com.aarogyakul.entity.TimelineEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TimelineEventRepository extends JpaRepository<TimelineEvent, UUID> {
    List<TimelineEvent> findByFamilyMemberIdOrderByEventDateDescCreatedAtDesc(UUID familyMemberId);
    Page<TimelineEvent> findByFamilyMemberId(UUID familyMemberId, Pageable pageable);
    void deleteByRelatedDocumentId(UUID relatedDocumentId);
}
