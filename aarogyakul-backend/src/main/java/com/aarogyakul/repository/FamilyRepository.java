package com.aarogyakul.repository;

import com.aarogyakul.entity.Family;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface FamilyRepository extends JpaRepository<Family, UUID> {
    Optional<Family> findByOwnerId(UUID ownerId);
    Optional<Family> findByIdAndOwnerId(UUID id, UUID ownerId);
    boolean existsByOwnerId(UUID ownerId);
}
