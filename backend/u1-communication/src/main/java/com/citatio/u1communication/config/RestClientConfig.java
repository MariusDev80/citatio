package com.citatio.u1communication.config;

import com.citatio.common.client.RestClientFactory;
import com.citatio.common.client.UpstreamClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Client vers le microservice u2-blog.
 * L'URL de base est injectee (nom de service Docker en prod, localhost en dev).
 *
 * <p>Le bean est cree au demarrage sans jamais contacter u2 : u1-communication
 * demarre et fonctionne meme si u2-blog est arrete.
 */
@Configuration
public class RestClientConfig {

    @Bean
    public UpstreamClient u2Client(@Value("${u2.base-url}") String u2BaseUrl) {
        return new UpstreamClient("u2-blog", RestClientFactory.create(u2BaseUrl));
    }
}
