package com.wubebereha.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "wubebereha")
public record AppProperties(String jwtSecret, String uploadDir) {
}
