package com.wubebereha.api.security;

import com.wubebereha.api.config.AppProperties;
import com.wubebereha.api.domain.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey secretKey;

    public JwtService(AppProperties appProperties) {
        this.secretKey = Keys.hmacShaKeyFor(appProperties.jwtSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(Long id, String email, String phone, UserRole role) {
        return Jwts.builder()
                .claim("id", id)
                .claim("email", email)
                .claim("phone", phone)
                .claim("role", role.name())
                .issuedAt(new Date())
                .signWith(secretKey)
                .compact();
    }

    public AuthUser parseToken(String token) {
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
    }
}
