package com.aarogyakul.controller;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.security.CurrentUser;
import com.aarogyakul.service.FamilyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/families")
public class FamilyController {
    private final FamilyService familyService;
    private final CurrentUser currentUser;

    public FamilyController(FamilyService familyService, CurrentUser currentUser) {
        this.familyService = familyService;
        this.currentUser = currentUser;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FamilyResponse create(@Valid @RequestBody CreateFamilyRequest request) {
        return familyService.create(currentUser.id(), request);
    }

    @GetMapping("/me")
    public FamilyResponse me() {
        return familyService.myFamily(currentUser.id());
    }
}
