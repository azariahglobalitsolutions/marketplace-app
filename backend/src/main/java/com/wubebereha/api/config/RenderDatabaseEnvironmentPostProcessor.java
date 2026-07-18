package com.wubebereha.api.config;

import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Maps Render's {@code DATABASE_URL} into {@code spring.datasource.url} before auto-configuration.
 */
public class RenderDatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE = "renderDatabase";

    @Override
    public void postProcessEnvironment(
            ConfigurableEnvironment environment,
            SpringApplication application
    ) {
        String jdbcUrl = DatabaseUrlConverter.toSpringDatasourceUrl(environment.getProperty("DATABASE_URL"));
        if (jdbcUrl == null) {
            return;
        }

        Map<String, Object> properties = new HashMap<>();
        properties.put("spring.datasource.url", jdbcUrl);
        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE, properties));
    }
}
