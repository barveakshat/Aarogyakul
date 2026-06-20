package com.aarogyakul.security;

import com.aarogyakul.entity.User;
import org.springframework.security.core.*;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class UserPrincipal implements UserDetails {
    public final UUID id;
    private final String email;
    private final String passwordHash;

    public UserPrincipal(User user) {
        this.id = user.id;
        this.email = user.email;
        this.passwordHash = user.passwordHash;
    }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(); }
    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return email; }
}
