package com.aarogyakul.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "chronic_conditions")
public class ChronicCondition {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "family_member_id")
    public FamilyMember familyMember;
    @Column(name = "condition_name", nullable = false)
    public String conditionName;
    @Column(name = "diagnosed_date")
    public LocalDate diagnosedDate;
    @Column(columnDefinition = "TEXT")
    public String notes;
}
