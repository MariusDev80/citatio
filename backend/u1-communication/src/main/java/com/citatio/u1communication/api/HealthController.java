package com.citatio.u1communication.api;

import com.citatio.common.dto.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint de sante du microservice u1-communication.
 * Expose sous /api/u1 (prefixe preserve par la gateway Caddy).
 */
@RestController
@RequestMapping("/api/u1")
public class HealthController {

    private static final String SERVICE_NAME = "u1-communication";

    @GetMapping("/health")
    public HealthResponse health() {
        return HealthResponse.up(SERVICE_NAME);
    }
}
