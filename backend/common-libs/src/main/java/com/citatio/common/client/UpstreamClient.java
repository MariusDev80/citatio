package com.citatio.common.client;

import com.citatio.common.dto.HealthResponse;
import com.citatio.common.dto.UpstreamStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Client vers un microservice voisin, garantissant la <b>degradation gracieuse</b>.
 *
 * <p>Tout echec d'appel (connexion refusee, timeout, 4xx, 5xx) est capture et
 * traduit en {@link UpstreamStatus#unreachable}. L'appelant n'a donc jamais a
 * gerer d'exception, et reste disponible meme si l'upstream est coupe : c'est
 * la garantie d'independance entre u1-communication et u2-blog.
 */
@Slf4j
@RequiredArgsConstructor
public class UpstreamClient {

    /** Nom du microservice appele, pour le log et la reponse. */
    private final String serviceName;

    private final RestClient restClient;

    /**
     * Interroge l'endpoint de sante de l'upstream.
     *
     * @param path chemin de l'endpoint (ex: "/api/u1/health")
     * @return l'etat de l'upstream — jamais {@code null}, ne leve jamais d'exception
     */
    public UpstreamStatus fetchHealth(String path) {
        try {
            HealthResponse body = restClient.get()
                    .uri(path)
                    .retrieve()
                    .body(HealthResponse.class);

            return UpstreamStatus.reachable(serviceName, body);

        } catch (RestClientException e) {
            // Volontairement non propage : l'indisponibilite d'un voisin est un etat
            // metier normal, pas une erreur du service courant.
            log.warn("Upstream {} injoignable ({}) : {}", serviceName, path, e.getMessage());
            return UpstreamStatus.unreachable(serviceName, e.getMessage());
        }
    }
}
