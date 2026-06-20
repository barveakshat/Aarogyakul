package com.aarogyakul.service;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.User;
import com.aarogyakul.exception.ApiException;
import com.aarogyakul.repository.UserRepository;
import com.aarogyakul.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
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
        return toAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.passwordHash)) {
            throw new BadCredentialsException("Invalid password");
        }
        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(user.id, user.email, user.fullName, jwtService.createToken(user.id, user.email));
    }
}
