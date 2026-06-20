package com.aarogyakul.security;

import com.aarogyakul.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository users;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository users) {
        this.jwtService = jwtService;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                var userId = jwtService.validateAndGetUserId(header.substring(7));
                users.findById(userId).ifPresent(user -> {
                    UserPrincipal principal = new UserPrincipal(user);
                    var auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                });
            } catch (JwtException | IllegalArgumentException ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }
}
