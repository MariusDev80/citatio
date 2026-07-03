package com.citatio.u2blog.api;

import com.citatio.common.dto.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint de sante du microservice u2-blog.
 * Expose sous /api/u2 (prefixe preserve par la gateway Caddy).
 */
@RestController
@RequestMapping("/api/u2")
public class HealthController {

    private static final String SERVICE_NAME = "u2-blog";

    @GetMapping("/health")
    public HealthResponse health() {
        return HealthResponse.up(SERVICE_NAME);
    }
}
