package com.aarogyakul.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiter for auth endpoints.
 * Uses a fixed-window per IP address. Production systems should
 * use Redis-backed rate limiting for multi-instance deployments.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private static final int AUTH_MAX_REQUESTS = 10;
    private static final int AUTH_WINDOW_SECONDS = 60;

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if (!isRateLimited(path)) {
            chain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String bucketKey = clientIp + ":" + path;
        TokenBucket bucket = buckets.computeIfAbsent(bucketKey,
                k -> new TokenBucket(AUTH_MAX_REQUESTS, AUTH_WINDOW_SECONDS));

        if (!bucket.tryConsume()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":{\"code\":\"RATE_LIMITED\",\"message\":\"Too many requests. Please try again later.\"}}");
            return;
        }

        chain.doFilter(request, response);
    }

    /** Evict stale buckets every 5 minutes to prevent unbounded map growth. */
    @Scheduled(fixedRate = 300_000)
    void evictStaleBuckets() {
        long cutoff = Instant.now().getEpochSecond() - (AUTH_WINDOW_SECONDS * 2L);
        buckets.entrySet().removeIf(e -> e.getValue().windowStart < cutoff);
    }

    private boolean isRateLimited(String path) {
        return path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register");
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Fixed-window token bucket. All access is synchronized to avoid
     * race conditions between window reset and token consumption.
     */
    private static class TokenBucket {
        private final int maxTokens;
        private final int windowSeconds;
        private int count;
        volatile long windowStart;

        TokenBucket(int maxTokens, int windowSeconds) {
            this.maxTokens = maxTokens;
            this.windowSeconds = windowSeconds;
            this.count = 0;
            this.windowStart = Instant.now().getEpochSecond();
        }

        synchronized boolean tryConsume() {
            long now = Instant.now().getEpochSecond();
            if (now - windowStart >= windowSeconds) {
                count = 0;
                windowStart = now;
            }
            return ++count <= maxTokens;
        }
    }
}
