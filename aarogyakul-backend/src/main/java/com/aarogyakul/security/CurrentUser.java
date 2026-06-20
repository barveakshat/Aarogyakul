package com.aarogyakul.security;

import com.aarogyakul.exception.ApiException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class CurrentUser {
    public UUID id() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.id;
        }
        throw ApiException.forbidden("Authentication required");
    }
}
