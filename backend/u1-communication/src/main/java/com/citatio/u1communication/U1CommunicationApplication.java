package com.citatio.u1communication;

import com.citatio.common.config.CommonWebConfig;
import com.citatio.common.web.ApiExceptionHandler;
import com.citatio.u1communication.mail.CitatioMailProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Import;

/**
 * Microservice u1-communication (email / contact / comms).
 * Base de donnees dediee : citatio_u1_db. Ecoute sur le port 8081.
 * Appelle le microservice u2-blog en REST (voir RestClientConfig), sans en dependre
 * pour demarrer ni pour repondre.
 *
 * <p>Recoit les demandes du formulaire de contact du site, les enregistre et
 * notifie l'equipe par email (paquets {@code contact} et {@code mail}).
 */
@SpringBootApplication
@Import({CommonWebConfig.class, ApiExceptionHandler.class})
// Declaration explicite plutot qu'un scan : une seule classe de proprietes, et
// on voit d'ou vient le binding sans avoir a le deviner.
@EnableConfigurationProperties(CitatioMailProperties.class)
public class U1CommunicationApplication {

    public static void main(String[] args) {
        SpringApplication.run(U1CommunicationApplication.class, args);
    }
}
