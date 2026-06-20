package com.aarogyakul.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "family_members")
public class FamilyMember {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "family_id")
    public Family family;
    @Column(name = "full_name", nullable = false)
    public String fullName;
    @Column(name = "date_of_birth")
    public LocalDate dateOfBirth;
    public String gender;
    @Column(name = "blood_group")
    public String bloodGroup;
    @Column(name = "relationship_to_owner")
    public String relationshipToOwner;
    @Column(name = "profile_photo_url")
    public String profilePhotoUrl;
    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = createdAt == null ? OffsetDateTime.now() : createdAt;
        updatedAt = updatedAt == null ? createdAt : updatedAt;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
