package com.citatio.u1communication;

import com.citatio.common.config.CommonWebConfig;
import com.citatio.common.web.ApiExceptionHandler;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/**
 * Microservice u1-communication (email / contact / comms).
 * Base de donnees dediee : citatio_u1_db. Ecoute sur le port 8081.
 * Appelle le microservice u2-blog en REST (voir RestClientConfig), sans en dependre
 * pour demarrer ni pour repondre.
 */
@SpringBootApplication
@Import({CommonWebConfig.class, ApiExceptionHandler.class})
public class U1CommunicationApplication {

    public static void main(String[] args) {
        SpringApplication.run(U1CommunicationApplication.class, args);
    }
}
