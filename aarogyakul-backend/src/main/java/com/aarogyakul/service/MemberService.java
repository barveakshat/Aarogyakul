package com.aarogyakul.service;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.*;
import com.aarogyakul.exception.ApiException;
import com.aarogyakul.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Service
public class MemberService {
    private final FamilyService familyService;
    private final FamilyMemberRepository members;
    private final AllergyRepository allergies;
    private final ChronicConditionRepository conditions;
    private final StorageService storage;
    private final Mapper mapper;

    public MemberService(FamilyService familyService, FamilyMemberRepository members, AllergyRepository allergies,
                         ChronicConditionRepository conditions, StorageService storage, Mapper mapper) {
        this.familyService = familyService;
        this.members = members;
        this.allergies = allergies;
        this.conditions = conditions;
        this.storage = storage;
        this.mapper = mapper;
    }

    @Transactional
    public MemberResponse create(UUID familyId, UUID userId, MemberRequest request) {
        Family family = familyService.requireOwnedFamily(familyId, userId);
        FamilyMember member = new FamilyMember();
        member.family = family;
        apply(member, request);
        return mapper.member(members.save(member));
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> list(UUID familyId, UUID userId) {
        familyService.requireOwnedFamily(familyId, userId);
        return members.findByFamilyIdOrderByCreatedAtAsc(familyId).stream().map(mapper::member).toList();
    }

    @Transactional(readOnly = true)
    public MemberResponse get(UUID memberId, UUID userId) {
        return mapper.member(requireOwnedMember(memberId, userId));
    }

    @Transactional
    public MemberResponse update(UUID memberId, UUID userId, MemberRequest request) {
        FamilyMember member = requireOwnedMember(memberId, userId);
        apply(member, request);
        return mapper.member(members.save(member));
    }

    @Transactional
    public MemberResponse uploadProfilePhoto(UUID memberId, UUID userId, MultipartFile file) {
        FamilyMember member = requireOwnedMember(memberId, userId);
        
        if (file == null || file.isEmpty()) {
            throw ApiException.validation("Photo file is required");
        }
        
        String originalFilename = Optional.ofNullable(file.getOriginalFilename()).orElse("photo.jpg");
        String ext = "jpg";
        int extIndex = originalFilename.lastIndexOf('.');
        if (extIndex > 0) {
            ext = originalFilename.substring(extIndex + 1);
        }
        
        Path temp;
        try {
            temp = Files.createTempFile("aarogyakul-photo-", "." + ext);
            file.transferTo(temp);
        } catch (Exception e) {
            throw ApiException.processing("Could not prepare uploaded photo");
        }
        
        String mimeType = Optional.ofNullable(file.getContentType()).orElse("image/jpeg");
        String key = "photos/%s/%s.%s".formatted(member.id, UUID.randomUUID(), ext);
        
        member.profilePhotoUrl = storage.put(key, temp, mimeType);
        return mapper.member(members.save(member));
    }

    @Transactional
    public void delete(UUID memberId, UUID userId) {
        FamilyMember member = requireOwnedMember(memberId, userId);
        members.delete(member);
    }

    @Transactional
    public AllergyResponse addAllergy(UUID memberId, UUID userId, AllergyRequest request) {
        FamilyMember member = requireOwnedMember(memberId, userId);
        Allergy allergy = new Allergy();
        allergy.familyMember = member;
        allergy.allergen = request.allergen().trim();
        allergy.severity = request.severity();
        allergy.notes = request.notes();
        return mapper.allergy(allergies.save(allergy));
    }

    @Transactional
    public ChronicConditionResponse addCondition(UUID memberId, UUID userId, ChronicConditionRequest request) {
        FamilyMember member = requireOwnedMember(memberId, userId);
        ChronicCondition condition = new ChronicCondition();
        condition.familyMember = member;
        condition.conditionName = request.conditionName().trim();
        condition.diagnosedDate = request.diagnosedDate();
        condition.notes = request.notes();
        return mapper.condition(conditions.save(condition));
    }

    @Transactional
    public void deleteAllergy(UUID memberId, UUID allergyId, UUID userId) {
        requireOwnedMember(memberId, userId);
        Allergy allergy = allergies.findById(allergyId).orElseThrow(() -> ApiException.notFound("Allergy not found"));
        if (!allergy.familyMember.id.equals(memberId)) throw ApiException.notFound("Allergy not found");
        allergies.delete(allergy);
    }

    @Transactional
    public void deleteCondition(UUID memberId, UUID conditionId, UUID userId) {
        requireOwnedMember(memberId, userId);
        ChronicCondition condition = conditions.findById(conditionId).orElseThrow(() -> ApiException.notFound("Condition not found"));
        if (!condition.familyMember.id.equals(memberId)) throw ApiException.notFound("Condition not found");
        conditions.delete(condition);
    }

    public FamilyMember requireOwnedMember(UUID memberId, UUID userId) {
        return members.findByIdAndFamilyOwnerId(memberId, userId)
                .orElseThrow(() -> ApiException.notFound("Family member not found"));
    }

    private void apply(FamilyMember member, MemberRequest request) {
        member.fullName = request.fullName().trim();
        member.dateOfBirth = request.dateOfBirth();
        member.gender = request.gender();
        member.bloodGroup = request.bloodGroup();
        member.relationshipToOwner = request.relationshipToOwner();
    }
}
