package com.aarogyakul.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "vaccinations")
public class Vaccination {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id")
    public MedicalDocument document;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "family_member_id")
    public FamilyMember familyMember;
    
    @Column(name = "vaccine_name", nullable = false)
    public String vaccineName;
    
    @Column(name = "dose_number")
    public String doseNumber;
    
    @Column(name = "date_administered")
    public LocalDate dateAdministered;
    
    @Column(name = "administered_by")
    public String administeredBy;
    
    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = createdAt == null ? OffsetDateTime.now() : createdAt;
    }
}
