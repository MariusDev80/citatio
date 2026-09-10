package com.citatio.u1communication.contact;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.citatio.u1communication.mail.MailDeliveryException;
import com.citatio.u1communication.mail.ContactMailSender;
import com.citatio.u1communication.mail.OutgoingMail;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

/**
 * Prise en charge d'une demande de contact, transport d'email mocke.
 *
 * <p>Ces tests portent sur la promesse du dispositif plus que sur son cablage :
 * une demande est <b>toujours</b> en base avant qu'un envoi soit tente, un envoi
 * en echec ne fait pas perdre le lead, et un leurre rempli n'ecrit rien.
 *
 * <p>{@code ContactNotifier} est monte pour de vrai et non mocke : son
 * {@code @Async} n'est actif que derriere un proxy Spring, donc ici l'envoi se
 * joue dans le fil du test, ce qui rend le statut final observable sans attente.
 */
@ExtendWith(MockitoExtension.class)
class ContactRequestServiceTest {

    @Mock
    private ContactRequestRepository repository;

    @Mock
    private ContactMailSender mailSender;

    private ContactRequestService service;

    /** Derniere entite passee au repository, tenant lieu de contenu de table. */
    private ContactRequest stored;

    @BeforeEach
    void setUp() {
        service = new ContactRequestService(repository, new ContactNotifier(mailSender, repository));
    }

    /**
     * Simule la persistance : attribue un identifiant a l'insertion et rend la
     * ligne relisible, ce dont le notifier a besoin pour y inscrire le statut.
     */
    private void givenPersistenceWorks() {
        given(repository.save(any(ContactRequest.class))).willAnswer(invocation -> {
            ContactRequest request = invocation.getArgument(0);
            if (request.getId() == null) {
                request.setId(1L);
            }
            stored = request;
            return request;
        });
        given(repository.findById(1L)).willAnswer(invocation -> Optional.ofNullable(stored));
    }

    private static ContactSubmission validSubmission() {
        return new ContactSubmission(
                "Camille Roy",
                "camille.roy@example.test",
                "Boulangerie Roy",
                "Création d’un premier site",
                "De 1 500 à 2 500 €",
                "Dans les 3 mois",
                "Nous voudrions un site vitrine avec nos horaires et nos produits.",
                Boolean.TRUE,
                "");
    }

    @Test
    @DisplayName("Demande valide : enregistree avec ses champs, son IP et son consentement")
    void persistsTheSubmission() {
        givenPersistenceWorks();

        Long id = service.submit(validSubmission(), "203.0.113.7");

        assertThat(id).isEqualTo(1L);
        assertThat(stored.getName()).isEqualTo("Camille Roy");
        assertThat(stored.getEmail()).isEqualTo("camille.roy@example.test");
        assertThat(stored.getProjectType()).isEqualTo("Création d’un premier site");
        assertThat(stored.getIpAddress()).isEqualTo("203.0.113.7");
        assertThat(stored.isConsent()).isTrue();
        assertThat(stored.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Reply-To porte l'email du prospect, et le corps reprend le message")
    void mailRepliesToTheProspect() {
        givenPersistenceWorks();

        service.submit(validSubmission(), "203.0.113.7");

        ArgumentCaptor<OutgoingMail> mail = ArgumentCaptor.forClass(OutgoingMail.class);
        verify(mailSender).send(mail.capture());
        assertThat(mail.getValue().replyTo()).isEqualTo("camille.roy@example.test");
        assertThat(mail.getValue().subject()).contains("Camille Roy", "Boulangerie Roy");
        assertThat(mail.getValue().body())
                .contains("camille.roy@example.test")
                .contains("Nous voudrions un site vitrine");
    }

    @Test
    @DisplayName("Champs facultatifs vides : leur ligne est omise, pas affichee vide")
    void optionalFieldsAreOmittedFromTheBody() {
        givenPersistenceWorks();
        ContactSubmission minimal = new ContactSubmission(
                "Sam Leroy", "sam@example.test", null, "Refonte d’un site existant", null, null,
                "Notre site actuel date de dix ans et ne s'affiche pas sur mobile.",
                Boolean.TRUE, null);

        service.submit(minimal, "203.0.113.8");

        ArgumentCaptor<OutgoingMail> mail = ArgumentCaptor.forClass(OutgoingMail.class);
        verify(mailSender).send(mail.capture());
        assertThat(mail.getValue().body())
                .doesNotContain("Entreprise :", "Budget", "Echeance");
    }

    @Test
    @DisplayName("Envoi reussi : statut SENT inscrit en base")
    void successfulDeliveryIsRecorded() {
        givenPersistenceWorks();

        service.submit(validSubmission(), "203.0.113.7");

        assertThat(stored.getMailStatus()).isEqualTo(MailStatus.SENT);
        assertThat(stored.getMailSettledAt()).isNotNull();
    }

    @Test
    @DisplayName("SMTP en echec : la demande reste en base, marquee FAILED, sans exception")
    void failedDeliveryKeepsTheLead() {
        givenPersistenceWorks();
        willThrow(new MailDeliveryException("SMTP injoignable", null))
                .given(mailSender).send(any(OutgoingMail.class));

        Long id = service.submit(validSubmission(), "203.0.113.7");

        // Rien ne remonte : cote client la demande reste un succes, et le lead
        // est en base. C'est tout l'interet d'enregistrer avant d'envoyer.
        assertThat(id).isEqualTo(1L);
        assertThat(stored.getMailStatus()).isEqualTo(MailStatus.FAILED);
        assertThat(stored.getMailSettledAt()).isNotNull();
    }

    @Test
    @DisplayName("Leurre rempli : rien en base, aucun mail, aucune erreur")
    void honeypotIsDroppedSilently() {
        ContactSubmission bot = new ContactSubmission(
                "Bot", "bot@example.test", null, "Refonte", null, null,
                "Message automatique suffisamment long pour passer la validation.",
                Boolean.TRUE, "https://spam.example.test");

        Long id = service.submit(bot, "203.0.113.9");

        assertThat(id).isNull();
        verify(repository, never()).save(any(ContactRequest.class));
        verify(repository, never()).findById(anyLong());
        verify(mailSender, never()).send(any(OutgoingMail.class));
    }
}
