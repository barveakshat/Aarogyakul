package com.aarogyakul.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "allergies")
public class Allergy {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "family_member_id")
    public FamilyMember familyMember;
    @Column(nullable = false)
    public String allergen;
    public String severity;
    @Column(columnDefinition = "TEXT")
    public String notes;
}
