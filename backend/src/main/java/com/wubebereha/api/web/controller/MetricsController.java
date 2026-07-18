package com.wubebereha.api.web.controller;

import io.micrometer.prometheusmetrics.PrometheusMeterRegistry;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MetricsController {

    private final ObjectProvider<PrometheusMeterRegistry> prometheusMeterRegistry;

    public MetricsController(ObjectProvider<PrometheusMeterRegistry> prometheusMeterRegistry) {
        this.prometheusMeterRegistry = prometheusMeterRegistry;
    }

    @GetMapping(value = "/metrics", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> metrics() {
        PrometheusMeterRegistry registry = prometheusMeterRegistry.getIfAvailable();
        if (registry == null) {
            return ResponseEntity.ok("");
        }
        return ResponseEntity.ok(registry.scrape());
    }
}
