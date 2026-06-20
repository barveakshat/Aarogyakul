package com.aarogyakul.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "families")
public class Family {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id")
    public User owner;
    @Column(name = "family_name", nullable = false)
    public String familyName;
    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = createdAt == null ? OffsetDateTime.now() : createdAt;
    }
}
