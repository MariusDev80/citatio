package com.citatio.u2blog.api;

import com.citatio.common.dto.HealthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

/**
 * Endpoint de demonstration du cablage inter-modules : u2-blog appelle
 * u1-communication en REST via le nom de service Docker et renvoie une
 * reponse combinee. Prouve que les microservices communiquent entre eux.
 */
@RestController
@RequestMapping("/api/u2")
@RequiredArgsConstructor
public class PingU1Controller {

    private final RestClient u1RestClient;

    @GetMapping("/ping-u1")
    public PingU1Response pingU1() {
        HealthResponse u1Health = u1RestClient.get()
                .uri("/api/u1/health")
                .retrieve()
                .body(HealthResponse.class);

        return new PingU1Response("u2-blog", u1Health);
    }
}
