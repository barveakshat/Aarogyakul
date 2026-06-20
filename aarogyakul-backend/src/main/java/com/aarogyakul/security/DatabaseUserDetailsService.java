package com.aarogyakul.security;

import com.aarogyakul.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {
    private final UserRepository users;

    public DatabaseUserDetailsService(UserRepository users) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        return users.findByEmailIgnoreCase(email)
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
