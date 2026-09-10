package com.citatio.u1communication.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Active {@code @Async}, utilise par {@code ContactNotifier}.
 *
 * <p>Sans cette annotation, {@code @Async} est ignore en silence et l'envoi
 * SMTP redevient synchrone : le visiteur attendrait la reponse du serveur de
 * mail, jusqu'a 5 secondes de timeout, avant de voir son formulaire se valider.
 *
 * <p>Aucun executeur declare : celui que Spring Boot configure par defaut
 * (bornes de pool comprises) convient a un volume de formulaire de contact.
 * Un executeur dedie ne se justifiera que le jour ou d'autres taches
 * asynchrones partageront la file.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
