package com.wubebereha.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_ATTEMPTS = 20;
    private static final long WINDOW_SECONDS = 60;

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (!HttpMethod.POST.matches(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        if (!"/api/auth/login".equals(path) && !"/api/auth/register".equals(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = clientKey(request);
        Window window = windows.computeIfAbsent(key, ignored -> new Window());
        if (!window.tryConsume()) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"Too many authentication attempts. Try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static final class Window {
        private final AtomicInteger count = new AtomicInteger();
        private volatile Instant resetAt = Instant.now().plusSeconds(WINDOW_SECONDS);

        boolean tryConsume() {
            Instant now = Instant.now();
            if (now.isAfter(resetAt)) {
                count.set(0);
                resetAt = now.plusSeconds(WINDOW_SECONDS);
            }
            return count.incrementAndGet() <= MAX_ATTEMPTS;
        }
    }
}
