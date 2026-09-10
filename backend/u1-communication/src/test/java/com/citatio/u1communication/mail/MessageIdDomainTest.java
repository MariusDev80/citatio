package com.citatio.u1communication.mail;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSender;

/**
 * Garde-fou de delivrabilite : le {@code Message-ID} doit porter notre domaine.
 *
 * <p>Sans la propriete {@code spring.mail.properties.mail.from}, JavaMail
 * fabrique ce domaine a partir du nom d'hote de la machine. En conteneur, cela
 * donne {@code <...@3f8a1c9d2e4b>} : un domaine inexistant, que les filtres
 * antispam relevent. Mesure faite sur cette configuration avant correction :
 * {@code <...@macbook-de-marius12.home>}.
 *
 * <p>Ce test echoue si quelqu'un retire la propriete, ce qui ne se verrait
 * autrement qu'en lisant les en-tetes d'un message deja parti en indesirable.
 */
@SpringBootTest
class MessageIdDomainTest {

    @Autowired
    private JavaMailSender javaMailSender;

    @Test
    @DisplayName("Le Message-ID est aligne sur le domaine expediteur, pas sur l'hote local")
    void messageIdCarriesTheSenderDomain() throws Exception {
        MimeMessage message = javaMailSender.createMimeMessage();
        message.setFrom("formulaire@example.test");
        message.setSubject("Demande de contact");
        message.setText("corps");

        // C'est saveChanges() qui fabrique Message-ID et Date, pas l'envoi :
        // le test n'ouvre donc aucune connexion SMTP.
        message.saveChanges();

        assertThat(message.getHeader("Message-ID")[0]).endsWith("@example.test>");
    }
}
