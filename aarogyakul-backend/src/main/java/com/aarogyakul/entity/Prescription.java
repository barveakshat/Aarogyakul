package com.aarogyakul.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "prescriptions")
public class Prescription {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id")
    public MedicalDocument document;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "family_member_id")
    public FamilyMember familyMember;
    
    @Column(name = "medication_name", nullable = false)
    public String medicationName;
    
    public String dosage;
    public String frequency;
    public String duration;
    
    @Column(name = "prescribing_doctor")
    public String prescribingDoctor;
    
    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = createdAt == null ? OffsetDateTime.now() : createdAt;
    }
}
