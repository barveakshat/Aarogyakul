package com.aarogyakul.controller;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.security.CurrentUser;
import com.aarogyakul.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@RestController
public class MemberController {
    private final MemberService memberService;
    private final CurrentUser currentUser;

    public MemberController(MemberService memberService, CurrentUser currentUser) {
        this.memberService = memberService;
        this.currentUser = currentUser;
    }

    @PostMapping("/api/families/{familyId}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public MemberResponse create(@PathVariable UUID familyId, @Valid @RequestBody MemberRequest request) {
        return memberService.create(familyId, currentUser.id(), request);
    }

    @GetMapping("/api/families/{familyId}/members")
    public List<MemberResponse> list(@PathVariable UUID familyId) {
        return memberService.list(familyId, currentUser.id());
    }

    @GetMapping("/api/members/{memberId}")
    public MemberResponse get(@PathVariable UUID memberId) {
        return memberService.get(memberId, currentUser.id());
    }

    @PutMapping("/api/members/{memberId}")
    public MemberResponse update(@PathVariable UUID memberId, @Valid @RequestBody MemberRequest request) {
        return memberService.update(memberId, currentUser.id(), request);
    }

    @PostMapping(value = "/api/members/{memberId}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MemberResponse> uploadProfilePhoto(
            @PathVariable UUID memberId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(memberService.uploadProfilePhoto(memberId, currentUser.id(), file));
    }

    @DeleteMapping("/api/members/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID memberId) {
        memberService.delete(memberId, currentUser.id());
    }

    @PostMapping("/api/members/{memberId}/allergies")
    @ResponseStatus(HttpStatus.CREATED)
    public AllergyResponse addAllergy(@PathVariable UUID memberId, @Valid @RequestBody AllergyRequest request) {
        return memberService.addAllergy(memberId, currentUser.id(), request);
    }

    @DeleteMapping("/api/members/{memberId}/allergies/{allergyId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAllergy(@PathVariable UUID memberId, @PathVariable UUID allergyId) {
        memberService.deleteAllergy(memberId, allergyId, currentUser.id());
    }

    @PostMapping("/api/members/{memberId}/conditions")
    @ResponseStatus(HttpStatus.CREATED)
    public ChronicConditionResponse addCondition(@PathVariable UUID memberId, @Valid @RequestBody ChronicConditionRequest request) {
        return memberService.addCondition(memberId, currentUser.id(), request);
    }

    @DeleteMapping("/api/members/{memberId}/conditions/{conditionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCondition(@PathVariable UUID memberId, @PathVariable UUID conditionId) {
        memberService.deleteCondition(memberId, conditionId, currentUser.id());
    }
}
