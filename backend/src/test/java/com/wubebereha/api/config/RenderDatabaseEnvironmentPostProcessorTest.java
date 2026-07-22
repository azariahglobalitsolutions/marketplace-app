package com.wubebereha.api.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.StandardEnvironment;

class RenderDatabaseEnvironmentPostProcessorTest {

    @Test
    void mapsRenderDatabaseUrlIntoSpringDatasourceProperties() {
        StandardEnvironment environment = new StandardEnvironment();
        environment.getSystemProperties().put(
                "DATABASE_URL",
                "postgresql://wubebereha:secret@dpg-example-a.oregon-postgres.render.com:5432/wubebereha"
        );

        new RenderDatabaseEnvironmentPostProcessor().postProcessEnvironment(environment, new SpringApplication());

        assertThat(environment.getProperty("spring.datasource.url"))
                .isEqualTo("jdbc:postgresql://dpg-example-a.oregon-postgres.render.com:5432/wubebereha");
        assertThat(environment.getProperty("SPRING_DATASOURCE_URL"))
                .isEqualTo("jdbc:postgresql://dpg-example-a.oregon-postgres.render.com:5432/wubebereha");
        assertThat(environment.getProperty("spring.datasource.username")).isEqualTo("wubebereha");
        assertThat(environment.getProperty("spring.datasource.password")).isEqualTo("secret");
    }

    @Test
    void leavesEnvironmentUnchangedWhenDatabaseUrlIsMissing() {
        StandardEnvironment environment = new StandardEnvironment();

        new RenderDatabaseEnvironmentPostProcessor().postProcessEnvironment(environment, new SpringApplication());

        assertThat(environment.getProperty("spring.datasource.url")).isNull();
    }
}
