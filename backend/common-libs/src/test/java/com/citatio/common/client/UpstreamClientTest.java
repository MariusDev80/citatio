package com.citatio.common.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import com.citatio.common.dto.UpstreamStatus;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Verifie la garantie centrale de l'architecture : un microservice injoignable
 * ne fait jamais echouer celui qui l'appelle.
 */
class UpstreamClientTest {

    // Port 1 : reserve et jamais en ecoute -> connexion refusee de maniere
    // deterministe, sans dependre d'un serveur mock.
    private static final String UNREACHABLE_BASE_URL = "http://localhost:1";

    private UpstreamClient unreachableClient() {
        return new UpstreamClient("u1-communication", RestClientFactory.create(UNREACHABLE_BASE_URL));
    }

    @Test
    @DisplayName("Un upstream coupe ne leve aucune exception")
    void fetchHealthDoesNotThrowWhenUpstreamIsDown() {
        assertThatCode(() -> unreachableClient().fetchHealth("/api/u1/health"))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Un upstream coupe est signale UNREACHABLE, sans payload")
    void fetchHealthReturnsUnreachableWhenUpstreamIsDown() {
        UpstreamStatus status = unreachableClient().fetchHealth("/api/u1/health");

        assertThat(status).isNotNull();
        assertThat(status.state()).isEqualTo(UpstreamStatus.UNREACHABLE);
        assertThat(status.service()).isEqualTo("u1-communication");
        assertThat(status.payload()).isNull();
        assertThat(status.detail()).isNotBlank();
    }
}
