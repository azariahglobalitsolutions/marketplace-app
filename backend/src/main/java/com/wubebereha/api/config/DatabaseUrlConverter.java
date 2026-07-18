package com.wubebereha.api.config;

/**
 * Converts Render/Heroku-style {@code postgresql://} URLs into JDBC URLs for Spring Boot.
 */
public final class DatabaseUrlConverter {

    private DatabaseUrlConverter() {
    }

    public static String toSpringDatasourceUrl(String databaseUrl) {
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return null;
        }

        if (databaseUrl.startsWith("jdbc:")) {
            return databaseUrl;
        }

        if (databaseUrl.startsWith("postgresql://")) {
            return "jdbc:postgresql://" + databaseUrl.substring("postgresql://".length());
        }

        if (databaseUrl.startsWith("postgres://")) {
            return "jdbc:postgresql://" + databaseUrl.substring("postgres://".length());
        }

        return databaseUrl;
    }
}
