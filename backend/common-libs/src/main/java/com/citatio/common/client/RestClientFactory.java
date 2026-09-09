package com.citatio.common.client;

import java.net.http.HttpClient;
import java.time.Duration;

import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Fabrique centralisee des clients REST inter-modules.
 *
 * <p>Les timeouts sont volontairement courts : un microservice injoignable ne doit
 * jamais bloquer celui qui l'appelle. Sans timeout, l'appelant se retrouve couple
 * a la disponibilite de l'appele, ce qui est exactement ce qu'on veut eviter.
 *
 * <p><b>Budget de temps.</b> Connexion et lecture se cumulent : un voisin mort
 * coute jusqu'a {@code CONNECT_TIMEOUT + READ_TIMEOUT}, soit 4 secondes. C'est
 * tenable pour un ping, et c'est precisement pour ne pas repayer ce prix a chaque
 * requete que {@link UpstreamClient} est protege par un disjoncteur.
 *
 * <p><b>Transport JDK et non {@code SimpleClientHttpRequestFactory}.</b> Cette
 * derniere s'appuie sur {@code HttpURLConnection}, sans pool de connexions : chaque
 * appel rouvre une socket, et le code est en maintenance minimale cote Spring.
 * {@link JdkClientHttpRequestFactory} utilise le client HTTP du JDK, qui garde les
 * connexions ouvertes (HTTP/1.1 keep-alive et HTTP/2) et gere le timeout de lecture
 * proprement.
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
     * Construit un {@link RestClient} pointant sur un microservice voisin, avec
     * les timeouts par defaut.
     *
     * <p>Fabrique statique : aucune dependance au bean auto-configure
     * {@code RestClient.Builder}, ce qui garde common-libs utilisable
     * hors contexte Spring (tests unitaires notamment).
     *
     * @param baseUrl URL de base de l'upstream (nom de service Docker en prod)
     */
    public static RestClient create(String baseUrl) {
        return builder(baseUrl)
                .requestFactory(requestFactory())
                .build();
    }

    /**
     * Builder <b>sans</b> fabrique de requetes, donc sans transport reel.
     *
     * <p>C'est le point d'accroche de {@code MockRestServiceServer}, qui installe
     * son propre transport sur le builder : lui passer un client deja construit,
     * ou un builder dont la fabrique est deja fixee, rendrait le mock inoperant.
     * Sans cette surcharge, les chemins nominal et 4xx/5xx de
     * {@link UpstreamClient} ne seraient pas testables.
     */
    public static RestClient.Builder builder(String baseUrl) {
        return RestClient.builder().baseUrl(baseUrl);
    }

    private static ClientHttpRequestFactory requestFactory() {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .build();

        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(READ_TIMEOUT);
        return factory;
    }
}
