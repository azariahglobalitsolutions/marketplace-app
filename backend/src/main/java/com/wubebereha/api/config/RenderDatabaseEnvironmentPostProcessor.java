package com.wubebereha.api.config;

import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Maps Render's {@code DATABASE_URL} into Spring datasource properties before auto-configuration.
 */
public class RenderDatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE = "renderDatabase";

    @Override
    public void postProcessEnvironment(
            ConfigurableEnvironment environment,
            SpringApplication application
    ) {
        DatabaseUrlConverter.ParsedDatabaseConfig config =
                DatabaseUrlConverter.parseDatabaseUrl(environment.getProperty("DATABASE_URL"));
        if (config == null) {
            return;
        }

        Map<String, Object> properties = new HashMap<>();
        properties.put("spring.datasource.url", config.jdbcUrl());
        properties.put("SPRING_DATASOURCE_URL", config.jdbcUrl());

        if (config.username() != null && !config.username().isBlank()) {
            properties.put("spring.datasource.username", config.username());
            properties.put("DATABASE_USERNAME", config.username());
        }
        if (config.password() != null) {
            properties.put("spring.datasource.password", config.password());
            properties.put("DATABASE_PASSWORD", config.password());
        }

        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE, properties));
    }
}
