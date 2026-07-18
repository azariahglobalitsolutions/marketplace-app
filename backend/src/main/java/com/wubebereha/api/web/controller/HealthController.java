package com.wubebereha.api.web.controller;

import com.wubebereha.api.web.dto.Dto.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("healthy", "wube-bereha-habesha-events");
    }
}
