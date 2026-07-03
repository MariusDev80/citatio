package com.citatio.u2blog.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Client REST vers le microservice u1-communication.
 * L'URL de base est injectee (nom de service Docker en prod, localhost en dev).
 */
@Configuration
public class RestClientConfig {

    @Bean
    public RestClient u1RestClient(@Value("${u1.base-url}") String u1BaseUrl) {

        // Timeouts courts : on ne veut pas qu'un u1 injoignable bloque u2.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(2));
        factory.setReadTimeout(Duration.ofSeconds(2));

        // Fabrique statique : pas de dependance au bean auto-configure RestClient.Builder.
        return RestClient.builder()
                .baseUrl(u1BaseUrl)
                .requestFactory(factory)
                .build();
    }
}
