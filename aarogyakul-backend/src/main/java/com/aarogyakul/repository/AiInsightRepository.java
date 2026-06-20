package com.aarogyakul.repository;

import com.aarogyakul.entity.AiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AiInsightRepository extends JpaRepository<AiInsight, UUID> {
    Optional<AiInsight> findByDocumentId(UUID documentId);
    void deleteByDocumentId(UUID documentId);
}
