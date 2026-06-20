package com.aarogyakul.entity;

import com.aarogyakul.util.Enums.TimelineEventType;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "timeline_events")
public class TimelineEvent {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "family_member_id")
    public FamilyMember familyMember;
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    public TimelineEventType eventType;
    @Column(name = "event_date", nullable = false)
    public LocalDate eventDate;
    @Column(nullable = false)
    public String title;
    @Column(columnDefinition = "TEXT")
    public String description;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_document_id")
    public MedicalDocument relatedDocument;
    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = createdAt == null ? OffsetDateTime.now() : createdAt;
    }
}
