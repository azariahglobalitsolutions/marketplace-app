package com.wubebereha.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                AuthUser user = jwtService.parseToken(header.substring(7));
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (InvalidJwtException ex) {
                SecurityContextHolder.clearContext();
                if (requiresAuthentication(request)) {
                    writeUnauthorized(response, ex.getMessage());
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean requiresAuthentication(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("/health".equals(path) || "/metrics".equals(path) || path.startsWith("/actuator/health")) {
            return false;
        }
        if (path.startsWith("/actuator/")) {
            return true;
        }
        if (HttpMethod.POST.matches(method) && ("/api/auth/register".equals(path) || "/api/auth/login".equals(path))) {
            return false;
        }
        if (HttpMethod.GET.matches(method) && isPublicReadPath(path)) {
            return false;
        }
        if (HttpMethod.POST.matches(method) && "/api/advertise/inquiry".equals(path)) {
            return false;
        }
        if (path.startsWith("/uploads/")) {
            return false;
        }
        return path.startsWith("/api/");
    }

    private boolean isPublicReadPath(String path) {
        return "/api/listings".equals(path)
                || "/api/listings/categories".equals(path)
                || "/api/listings/states".equals(path)
                || "/api/events".equals(path)
                || "/api/advertise/tiers".equals(path)
                || (path.startsWith("/api/listings/") && path.chars().filter(ch -> ch == '/').count() == 2)
                || (path.startsWith("/api/events/") && path.chars().filter(ch -> ch == '/').count() == 2);
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        String safeMessage = message == null ? "Unauthorized" : message.replace("\"", "\\\"");
        response.getWriter().write("{\"error\":\"" + safeMessage + "\"}");
    }
}
