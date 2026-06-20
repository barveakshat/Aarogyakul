package com.aarogyakul.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_insights")
public class AiInsight {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id")
    public MedicalDocument document;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "family_member_id")
    public FamilyMember familyMember;
    @Column(name = "summary_text", nullable = false, columnDefinition = "TEXT")
    public String summaryText;
    @Column(name = "comparison_json", columnDefinition = "TEXT")
    public String comparisonJson;
    @Column(name = "model_used", nullable = false)
    public String modelUsed;
    @Column(name = "generated_at", nullable = false)
    public OffsetDateTime generatedAt;

    @PrePersist
    void prePersist() {
        generatedAt = generatedAt == null ? OffsetDateTime.now() : generatedAt;
    }
}
