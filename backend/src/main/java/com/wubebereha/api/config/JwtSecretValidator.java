package com.wubebereha.api.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
public class JwtSecretValidator {

    private static final String PLACEHOLDER = "change-this-to-a-long-random-secret-key";

    private final Environment environment;

    public JwtSecretValidator(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validateJwtSecret() {
        String secret = environment.getProperty("wubebereha.jwt-secret");
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET must be configured");
        }
        if (PLACEHOLDER.equals(secret)) {
            throw new IllegalStateException("JWT_SECRET must not use the default placeholder value");
        }
        if (secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes");
        }
    }
}
