package com.aarogyakul.repository;

import com.aarogyakul.entity.TimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TimelineEventRepository extends JpaRepository<TimelineEvent, UUID> {
    List<TimelineEvent> findByFamilyMemberIdOrderByEventDateDescCreatedAtDesc(UUID familyMemberId);
    void deleteByRelatedDocumentId(UUID relatedDocumentId);
}
