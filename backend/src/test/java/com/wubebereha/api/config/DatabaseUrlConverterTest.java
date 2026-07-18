package com.wubebereha.api.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class DatabaseUrlConverterTest {

    @Test
    void convertsRenderPostgresqlUrlToJdbc() {
        assertThat(DatabaseUrlConverter.toSpringDatasourceUrl(
                "postgresql://user:pass@host.example:5432/wubebereha"))
                .isEqualTo("jdbc:postgresql://host.example:5432/wubebereha");
    }

    @Test
    void parsesCredentialsFromRenderUrl() {
        DatabaseUrlConverter.ParsedDatabaseConfig config = DatabaseUrlConverter.parseDatabaseUrl(
                "postgresql://wubebereha:secret@host.example:5432/wubebereha");

        assertThat(config.jdbcUrl()).isEqualTo("jdbc:postgresql://host.example:5432/wubebereha");
        assertThat(config.username()).isEqualTo("wubebereha");
        assertThat(config.password()).isEqualTo("secret");
    }

    @Test
    void leavesJdbcUrlsUnchanged() {
        String jdbc = "jdbc:postgresql://localhost:5432/wubebereha";
        assertThat(DatabaseUrlConverter.toSpringDatasourceUrl(jdbc)).isEqualTo(jdbc);
    }

    @Test
    void returnsNullForBlankInput() {
        assertThat(DatabaseUrlConverter.toSpringDatasourceUrl(null)).isNull();
        assertThat(DatabaseUrlConverter.toSpringDatasourceUrl("  ")).isNull();
    }
}
