package com.wubebereha.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(properties = "FRONTEND_ALLOWED_ORIGIN=https://render-frontend.example")
class CorsPropertiesTest {

    @Autowired
    private AppProperties appProperties;

    @Test
    void bindsFrontendAllowedOriginFromEnvironmentVariable() {
        assertThat(appProperties.frontendAllowedOrigin()).isEqualTo("https://render-frontend.example");
    }
}
