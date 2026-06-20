package com.aarogyakul.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    @Column(nullable = false, unique = true)
    public String email;
    @Column(name = "password_hash", nullable = false)
    public String passwordHash;
    @Column(name = "full_name", nullable = false)
    public String fullName;
    @Column(name = "phone_number")
    public String phoneNumber;
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
