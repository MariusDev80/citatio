package com.citatio.common.client;

import java.time.Duration;

import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Fabrique centralisee des clients REST inter-modules.
 *
 * <p>Les timeouts sont volontairement courts : un microservice injoignable ne doit
 * jamais bloquer celui qui l'appelle. Sans timeout, l'appelant se retrouve couple
 * a la disponibilite de l'appele, ce qui est exactement ce qu'on veut eviter.
 */
public final class RestClientFactory {

    /** Delai d'etablissement de la connexion TCP. */
    public static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(2);

    /** Delai de lecture de la reponse. */
    public static final Duration READ_TIMEOUT = Duration.ofSeconds(2);

    private RestClientFactory() {
        // Classe utilitaire : pas d'instanciation.
    }

    /**
     * Construit un {@link RestClient} pointant sur un microservice voisin.
     *
     * <p>Fabrique statique : aucune dependance au bean auto-configure
     * {@code RestClient.Builder}, ce qui garde common-libs utilisable
     * hors contexte Spring (tests unitaires notamment).
     *
     * @param baseUrl URL de base de l'upstream (nom de service Docker en prod)
     */
    public static RestClient create(String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT);
        factory.setReadTimeout(READ_TIMEOUT);

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}
