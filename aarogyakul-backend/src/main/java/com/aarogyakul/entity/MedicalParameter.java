package com.aarogyakul.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "medical_parameters")
public class MedicalParameter {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id")
    public MedicalDocument document;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "family_member_id")
    public FamilyMember familyMember;
    @Column(name = "parameter_name", nullable = false)
    public String parameterName;
    @Column(nullable = false, precision = 10, scale = 3)
    public BigDecimal value;
    public String unit;
    @Column(name = "reference_range_low", precision = 10, scale = 3)
    public BigDecimal referenceRangeLow;
    @Column(name = "reference_range_high", precision = 10, scale = 3)
    public BigDecimal referenceRangeHigh;
    @Column(name = "report_date", nullable = false)
    public LocalDate reportDate;
    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = createdAt == null ? OffsetDateTime.now() : createdAt;
    }
}
