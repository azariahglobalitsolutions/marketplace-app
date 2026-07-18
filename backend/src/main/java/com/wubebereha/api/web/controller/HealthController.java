package com.wubebereha.api.web.controller;

import com.wubebereha.api.web.dto.Dto.HealthResponse;
import java.sql.Connection;
import javax.sql.DataSource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public HealthResponse health() {
        try (Connection connection = dataSource.getConnection()) {
            if (!connection.isValid(2)) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Database unavailable");
            }
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Database unavailable");
        }

        return new HealthResponse("healthy", "wube-bereha-habesha-events");
    }
}
