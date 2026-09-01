package com.citatio.u2blog;

import com.citatio.common.config.CommonWebConfig;
import com.citatio.common.web.ApiExceptionHandler;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/**
 * Microservice u2-blog (articles / blog).
 * Base de donnees dediee : citatio_u2_db. Ecoute sur le port 8082.
 * Appelle le microservice u1-communication en REST (voir RestClientConfig), sans en
 * dependre pour demarrer ni pour repondre.
 */
@SpringBootApplication
@Import({CommonWebConfig.class, ApiExceptionHandler.class})
public class U2BlogApplication {

    public static void main(String[] args) {
        SpringApplication.run(U2BlogApplication.class, args);
    }
}
