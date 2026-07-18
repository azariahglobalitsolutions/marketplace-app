package com.wubebereha.api.config;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;

/**
 * Converts Render/Heroku-style {@code postgresql://} URLs into JDBC URLs and credentials for Spring Boot.
 */
public final class DatabaseUrlConverter {

    public record ParsedDatabaseConfig(String jdbcUrl, String username, String password) {
    }

    private DatabaseUrlConverter() {
    }

    public static String toSpringDatasourceUrl(String databaseUrl) {
        ParsedDatabaseConfig config = parseDatabaseUrl(databaseUrl);
        return config != null ? config.jdbcUrl() : null;
    }

    public static ParsedDatabaseConfig parseDatabaseUrl(String databaseUrl) {
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return null;
        }

        if (databaseUrl.startsWith("jdbc:")) {
            return new ParsedDatabaseConfig(databaseUrl, null, null);
        }

        String normalized = databaseUrl;
        if (databaseUrl.startsWith("postgresql://")) {
            normalized = "postgres://" + databaseUrl.substring("postgresql://".length());
        }

        if (!normalized.startsWith("postgres://")) {
            return new ParsedDatabaseConfig(databaseUrl, null, null);
        }

        try {
            URI uri = new URI(normalized);
            String userInfo = uri.getUserInfo();
            String username = null;
            String password = null;

            if (userInfo != null && !userInfo.isBlank()) {
                int separator = userInfo.indexOf(':');
                if (separator >= 0) {
                    username = decode(userInfo.substring(0, separator));
                    password = decode(userInfo.substring(separator + 1));
                } else {
                    username = decode(userInfo);
                }
            }

            String jdbcUrl = "jdbc:postgresql://" + buildAuthority(uri) + buildPath(uri);
            return new ParsedDatabaseConfig(jdbcUrl, username, password);
        } catch (URISyntaxException ex) {
            if (databaseUrl.startsWith("postgresql://")) {
                return new ParsedDatabaseConfig(
                        "jdbc:postgresql://" + databaseUrl.substring("postgresql://".length()),
                        null,
                        null
                );
            }
            return new ParsedDatabaseConfig(databaseUrl, null, null);
        }
    }

    private static String buildAuthority(URI uri) {
        String host = uri.getHost();
        int port = uri.getPort();
        if (host == null) {
            return "";
        }
        return port > 0 ? host + ":" + port : host;
    }

    private static String buildPath(URI uri) {
        String path = uri.getPath();
        if (path == null || path.isBlank()) {
            return "";
        }
        String query = uri.getQuery();
        if (query == null || query.isBlank()) {
            return path;
        }
        return path + "?" + query;
    }

    private static String decode(String value) {
        return java.net.URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
