package com.citatio.u1communication.mail;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Adresses de l'envoi, prefixe {@code citatio.mail}.
 *
 * <p>Rien n'est code en dur : le compte expediteur n'est pas arrete et devra
 * pouvoir changer sans toucher au code ni reconstruire l'image. Les trois
 * valeurs viennent de variables d'environnement (MAIL_FROM, MAIL_FROM_NAME,
 * MAIL_TO), avec des defauts dans application.properties.
 *
 * <p>Les identifiants SMTP, eux, restent sous {@code spring.mail.*} : ce sont
 * des secrets, ils n'ont pas leur place dans un type applicatif.
 *
 * @param from     adresse d'envoi, celle du compte SMTP authentifie
 * @param fromName nom affiche a cote de l'adresse d'envoi
 * @param to       boite qui recoit les demandes
 */
@ConfigurationProperties(prefix = "citatio.mail")
public record CitatioMailProperties(String from, String fromName, String to) {
}
