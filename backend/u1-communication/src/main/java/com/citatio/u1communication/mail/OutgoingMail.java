package com.citatio.u1communication.mail;

/**
 * Message a envoyer, decrit sans rien supposer du transport.
 *
 * <p>Ni expediteur ni destinataire ici : ils viennent de la configuration et
 * appartiennent a l'implementation. Le metier ne connait que ce qu'il a a dire
 * et a qui la reponse doit revenir.
 *
 * @param subject   objet du message
 * @param body      corps en texte brut
 * @param replyTo   adresse du prospect, posee en {@code Reply-To} pour qu'un clic
 *                  sur "Repondre" ecrive au prospect et non a la boite d'envoi
 */
public record OutgoingMail(String subject, String body, String replyTo) {
}
