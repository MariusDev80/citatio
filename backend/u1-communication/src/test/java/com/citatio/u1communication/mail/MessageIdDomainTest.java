package com.citatio.u1communication.mail;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Garde-fous de delivrabilite.
 *
 * <p>Deux en-tetes trahissaient le conteneur Docker au lieu de nommer notre
 * domaine. Ils ont chacun coute un passage en indesirable, et aucun des deux ne
 * se voit sans lire la source d'un message deja recu : d'ou ces tests.
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

    /**
     * Nom annonce au EHLO.
     *
     * <p>On verifie la propriete de session et non la conversation SMTP : ouvrir
     * un vrai dialogue demanderait un serveur de test, donc une dependance de
     * plus. La mesure a ete faite une fois avec un puits SMTP jetable, elle est
     * sans ambiguite : sans la propriete, JavaMail annonce {@code EHLO
     * macbook-de-marius12.home} en local et {@code EHLO 18b9c67103d0} en
     * conteneur ; avec elle, {@code EHLO example.test} ici.
     */
    @Test
    @DisplayName("Le EHLO annonce un nom de domaine, pas le nom d'hote du conteneur")
    void ehloAnnouncesADomainName() {
        Object announced = ((JavaMailSenderImpl) javaMailSender)
                .getJavaMailProperties().get("mail.smtp.localhost");

        assertThat(announced).isEqualTo("example.test");
        assertThat(String.valueOf(announced))
                .as("un EHLO sans point n'est pas un nom pleinement qualifie")
                .contains(".");
    }

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
