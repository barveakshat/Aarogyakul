package com.aarogyakul.service;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.Family;
import com.aarogyakul.entity.FamilyMember;
import com.aarogyakul.entity.User;
import com.aarogyakul.exception.ApiException;
import com.aarogyakul.repository.FamilyRepository;
import com.aarogyakul.repository.FamilyMemberRepository;
import com.aarogyakul.repository.UserRepository;
import com.aarogyakul.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final FamilyRepository families;
    private final FamilyMemberRepository members;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, FamilyRepository families, FamilyMemberRepository members, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.families = families;
        this.members = members;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw ApiException.validation("Email is already registered");
        }
        User user = new User();
        user.email = request.email().trim().toLowerCase();
        user.passwordHash = passwordEncoder.encode(request.password());
        user.fullName = request.fullName().trim();
        user.phoneNumber = request.phoneNumber();
        user = users.save(user);

        // Auto-create Family and Member (Netflix style)
        Family family = new Family();
        family.owner = user;
        String[] nameParts = user.fullName.trim().split(" ");
        String lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : user.fullName.trim();
        family.familyName = lastName + " Family";
        family = families.save(family);

        FamilyMember member = new FamilyMember();
        member.family = family;
        member.fullName = user.fullName.trim();
        member.relationshipToOwner = "Self";
        members.save(member);

        return toAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.passwordHash)) {
            throw new BadCredentialsException("Invalid email or password");
        }
        return toAuthResponse(user);
    }

    @Transactional
    public void changePassword(java.util.UUID userId, String currentPassword, String newPassword) {
        User user = users.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.passwordHash)) {
            throw ApiException.validation("Current password is incorrect");
        }
        user.passwordHash = passwordEncoder.encode(newPassword);
        users.save(user);
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(user.id, user.email, user.fullName, jwtService.createToken(user.id, user.email));
    }
}
