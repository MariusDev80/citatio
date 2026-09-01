package com.citatio.u2blog.api;

import com.citatio.common.client.UpstreamClient;
import com.citatio.common.dto.UpstreamStatus;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint de cablage inter-modules : u2-blog appelle u1-communication en REST
 * via le nom de service Docker.
 *
 * <p>Renvoie <b>toujours HTTP 200</b> : l'endpoint rapporte l'etat de la liaison,
 * il n'echoue pas avec elle. Si u1 est coupe, la reponse porte
 * {@code state = "UNREACHABLE"} et u2-blog reste pleinement disponible.
 */
@RestController
@RequestMapping("/api/u2")
@RequiredArgsConstructor
public class PingU1Controller {

    private static final String U1_HEALTH_PATH = "/api/u1/health";

    private final UpstreamClient u1Client;

    @GetMapping("/ping-u1")
    public UpstreamStatus pingU1() {
        return u1Client.fetchHealth(U1_HEALTH_PATH);
    }
}
