package com.aarogyakul.controller;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.security.CurrentUser;
import com.aarogyakul.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String COOKIE_NAME = "aarogyakul_token";
    private final AuthService authService;
    private final CurrentUser currentUser;
    private final long jwtExpiryHours;
    private final boolean cookieSecure;

    public AuthController(AuthService authService, CurrentUser currentUser,
                          @Value("${app.jwt-expiry-hours}") long jwtExpiryHours,
                          @Value("${app.cookie-secure:false}") boolean cookieSecure) {
        this.authService = authService;
        this.currentUser = currentUser;
        this.jwtExpiryHours = jwtExpiryHours;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthUserResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.register(request);
        setTokenCookie(response, auth.accessToken());
        return new AuthUserResponse(auth.userId(), auth.email(), auth.fullName());
    }

    @PostMapping("/login")
    public AuthUserResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.login(request);
        setTokenCookie(response, auth.accessToken());
        return new AuthUserResponse(auth.userId(), auth.email(), auth.fullName());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSecure ? "None" : "Lax")
                .path("/api")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @PostMapping("/api/account/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(currentUser.id(), request.currentPassword(), request.newPassword());
    }

    private void setTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSecure ? "None" : "Lax")
                .path("/api")
                .maxAge(jwtExpiryHours * 3600)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
