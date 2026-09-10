package com.citatio.u1communication.mail;

/**
 * Transport d'email du module, vu par le metier.
 *
 * <p>L'interface existe pour que le jour ou l'envoi passe d'un SMTP a une API
 * transactionnelle (Brevo, Postmark, Resend), seule une implementation change :
 * ni le service de contact ni ses tests ne bougent.
 *
 * <p>Le prefixe {@code Contact} n'est pas decoratif : sans lui, le type
 * masquerait {@code org.springframework.mail.MailSender}, l'abstraction de
 * Spring, que ce projet n'utilise pas directement. La seule implementation
 * ({@link SmtpMailSender}) s'appuie sur {@code JavaMailSender}, et rien d'autre
 * dans le module ne connait Spring Mail.
 */
public interface ContactMailSender {

    /**
     * Envoie le message. Synchrone et sans filet : l'appelant decide quoi faire
     * d'un echec (ici {@code ContactNotifier}, qui le trace en base et en log).
     *
     * @throws MailDeliveryException si le message n'a pas pu etre remis
     */
    void send(OutgoingMail mail);
}
