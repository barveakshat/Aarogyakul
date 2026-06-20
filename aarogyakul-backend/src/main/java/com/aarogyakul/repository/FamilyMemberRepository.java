package com.aarogyakul.repository;

import com.aarogyakul.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, UUID> {
    List<FamilyMember> findByFamilyIdOrderByCreatedAtAsc(UUID familyId);
    Optional<FamilyMember> findByIdAndFamilyOwnerId(UUID id, UUID ownerId);
}
