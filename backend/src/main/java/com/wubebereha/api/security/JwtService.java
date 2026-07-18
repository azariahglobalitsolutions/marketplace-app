package com.wubebereha.api.security;

import com.wubebereha.api.config.AppProperties;
import com.wubebereha.api.domain.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationHours;

    public JwtService(AppProperties appProperties) {
        this.secretKey = Keys.hmacShaKeyFor(appProperties.jwtSecret().getBytes(StandardCharsets.UTF_8));
        this.expirationHours = appProperties.jwtExpirationHours();
    }

    public String createToken(Long id, String email, String phone, UserRole role) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(expirationHours * 3600);

        return Jwts.builder()
                .claim("id", id)
                .claim("email", email)
                .claim("phone", phone)
                .claim("role", role.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    public AuthUser parseToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Long id = claims.get("id", Number.class).longValue();
            String email = claims.get("email", String.class);
            String phone = claims.get("phone", String.class);
            UserRole role = UserRole.valueOf(claims.get("role", String.class));
            return new AuthUser(id, email, phone, role);
        } catch (ExpiredJwtException ex) {
            throw new InvalidJwtException("Token expired", ex);
        } catch (RuntimeException ex) {
            throw new InvalidJwtException("Invalid token", ex);
        }
    }
}
