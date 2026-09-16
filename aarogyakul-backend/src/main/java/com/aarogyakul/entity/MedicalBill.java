package com.aarogyakul.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "medical_bills")
public class MedicalBill {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id")
    public MedicalDocument document;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "family_member_id")
    public FamilyMember familyMember;
    
    @Column(name = "provider_name", nullable = false)
    public String providerName;
    
    @Column(name = "total_amount", precision = 12, scale = 2)
    public BigDecimal totalAmount;
    
    @Column(name = "date_of_service")
    public LocalDate dateOfService;
    
    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = createdAt == null ? OffsetDateTime.now() : createdAt;
    }
}
