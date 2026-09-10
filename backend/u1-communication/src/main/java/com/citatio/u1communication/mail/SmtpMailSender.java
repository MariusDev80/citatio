package com.citatio.u1communication.mail;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

/**
 * Envoi par SMTP, seule implementation de {@link ContactMailSender} aujourd'hui.
 *
 * <p>Hote, port, identifiants et TLS viennent de {@code spring.mail.*}, donc de
 * variables d'environnement : changer de compte d'envoi ne demande aucune
 * modification ici.
 *
 * <p>Le message est construit en MIME plutot qu'en {@code SimpleMailMessage}
 * pour deux raisons : afficher un nom d'expediteur lisible a cote de l'adresse
 * technique, et fixer l'encodage UTF-8 (sans quoi les accents des messages
 * francais arrivent abimes selon le serveur).
 */
@Component
@RequiredArgsConstructor
public class SmtpMailSender implements ContactMailSender {

    private final JavaMailSender javaMailSender;
    private final CitatioMailProperties properties;

    @Override
    public void send(OutgoingMail mail) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());

            helper.setFrom(new InternetAddress(
                    properties.from(), properties.fromName(), StandardCharsets.UTF_8.name()));
            helper.setTo(properties.to());
            // Le From reste la boite d'envoi (SPF et DKIM sont alignes sur elle,
            // usurper l'adresse du prospect ferait tomber le message en spam).
            // C'est le Reply-To qui rend le "Repondre" utile.
            helper.setReplyTo(mail.replyTo());
            helper.setSubject(mail.subject());
            helper.setText(mail.body(), false);

            javaMailSender.send(message);
        } catch (jakarta.mail.MessagingException
                 | UnsupportedEncodingException
                 | org.springframework.mail.MailException e) {
            throw new MailDeliveryException("Envoi SMTP en echec", e);
        }
    }
}
