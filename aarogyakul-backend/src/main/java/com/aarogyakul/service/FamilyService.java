package com.aarogyakul.service;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.*;
import com.aarogyakul.exception.ApiException;
import com.aarogyakul.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class FamilyService {
    private final UserRepository users;
    private final FamilyRepository families;
    private final FamilyMemberRepository members;
    private final Mapper mapper;

    public FamilyService(UserRepository users, FamilyRepository families, FamilyMemberRepository members, Mapper mapper) {
        this.users = users;
        this.families = families;
        this.members = members;
        this.mapper = mapper;
    }

    @Transactional
    public FamilyResponse create(UUID userId, CreateFamilyRequest request) {
        if (families.existsByOwnerId(userId)) {
            throw ApiException.validation("One family per user is supported in the MVP");
        }
        User owner = users.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        Family family = new Family();
        family.owner = owner;
        family.familyName = request.familyName().trim();
        family = families.save(family);
        return mapper.family(family, List.of());
    }

    @Transactional(readOnly = true)
    public FamilyResponse myFamily(UUID userId) {
        Family family = families.findByOwnerId(userId)
                .orElseThrow(() -> ApiException.notFound("Family not found"));
        var memberResponses = members.findByFamilyIdOrderByCreatedAtAsc(family.id).stream()
                .map(mapper::member)
                .toList();
        return mapper.family(family, memberResponses);
    }

    public Family requireOwnedFamily(UUID familyId, UUID userId) {
        return families.findByIdAndOwnerId(familyId, userId)
                .orElseThrow(() -> ApiException.forbidden("You do not have access to this family"));
    }
}
