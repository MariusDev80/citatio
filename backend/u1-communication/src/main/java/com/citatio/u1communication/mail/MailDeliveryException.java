package com.citatio.u1communication.mail;

/**
 * Echec d'envoi, en exception non verifiee.
 *
 * <p>Uniformise ce que remontent les implementations : JavaMail leve des
 * exceptions verifiees, une API HTTP en leverait de tout autres. L'appelant
 * n'a qu'un type a attraper, quel que soit le transport du moment.
 *
 * <p>Ne remonte jamais au client : {@code ContactNotifier} l'absorbe, la reponse
 * HTTP est deja partie quand l'envoi echoue.
 */
public class MailDeliveryException extends RuntimeException {

    public MailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
