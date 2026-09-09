package com.citatio.u2blog.config;

import com.citatio.common.client.RestClientFactory;
import com.citatio.common.client.UpstreamClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Client vers le microservice u1-communication.
 * L'URL de base est injectee (nom de service Docker en prod, localhost en dev).
 *
 * <p>Le bean est cree au demarrage sans jamais contacter u1 : u2-blog demarre
 * et fonctionne meme si u1-communication est arrete.
 */
@Configuration
public class RestClientConfig {

    /** Endpoint de sante expose par u1, cf. son HealthController. */
    private static final String U1_HEALTH_PATH = "/api/u1/health";

    @Bean
    public UpstreamClient u1Client(@Value("${u1.base-url}") String u1BaseUrl) {
        return new UpstreamClient("u1-communication", RestClientFactory.create(u1BaseUrl), U1_HEALTH_PATH);
    }
}
