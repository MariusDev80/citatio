package com.citatio.u1communication.api;

import com.citatio.common.client.UpstreamClient;
import com.citatio.common.dto.UpstreamStatus;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint de cablage inter-modules : u1-communication appelle u2-blog en REST
 * via le nom de service Docker. Miroir de {@code PingU1Controller} cote u2.
 *
 * <p>Renvoie <b>toujours HTTP 200</b> : si u2 est coupe, la reponse porte
 * {@code state = "UNREACHABLE"} et u1-communication reste pleinement disponible.
 */
@RestController
@RequestMapping("/api/u1")
@RequiredArgsConstructor
public class PingU2Controller {

    private static final String U2_HEALTH_PATH = "/api/u2/health";

    private final UpstreamClient u2Client;

    @GetMapping("/ping-u2")
    public UpstreamStatus pingU2() {
        return u2Client.fetchHealth(U2_HEALTH_PATH);
    }
}
