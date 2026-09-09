package com.citatio.u1communication.contact;

import com.citatio.u1communication.mail.ContactMailSender;
import com.citatio.u1communication.mail.OutgoingMail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.stream.Stream;

/**
 * Previent l'equipe qu'une demande est arrivee, hors du fil de la requete HTTP.
 *
 * <p><b>Bean distinct de {@link ContactRequestService} et ce n'est pas un
 * decoupage esthetique</b> : {@code @Async} passe par un proxy, un appel entre
 * deux methodes du meme bean ne le traverserait pas et l'envoi redeviendrait
 * synchrone sans que rien ne le signale. Le visiteur attendrait alors la
 * poignee de main SMTP, soit jusqu'a 5 secondes de timeout.
 *
 * <p>Un echec d'envoi ne remonte nulle part : la reponse HTTP est deja partie,
 * et la demande est deja en base. Il est trace en ERROR et inscrit en base,
 * les deux endroits ou on ira le chercher.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ContactNotifier {

    private final ContactMailSender mailSender;
    private final ContactRequestRepository repository;

    @Async
    public void notifyTeam(Long requestId, ContactSubmission submission) {
        try {
            mailSender.send(new OutgoingMail(
                    subjectFor(submission), bodyFor(submission), submission.email()));
            settle(requestId, MailStatus.SENT);
        } catch (RuntimeException e) {
            // On loggue la cause complete ici, et nulle part ailleurs : elle
            // contient l'hote SMTP et parfois le compte, qui n'ont rien a faire
            // dans une reponse (meme lecon que le motif ferme d'UpstreamClient).
            log.error("Notification de la demande de contact {} non envoyee, "
                    + "la demande reste en base", requestId, e);
            settle(requestId, MailStatus.FAILED);
        }
    }

    /**
     * Inscrit l'issue de l'envoi.
     *
     * <p>Pas de {@code @Transactional} : appelee depuis la meme instance, elle
     * ne passerait pas par le proxy et l'annotation serait sans effet. Les deux
     * appels au repository portent chacun leur transaction, ce qui suffit pour
     * une mise a jour d'un champ.
     *
     * <p>{@code findById} peut revenir vide si la ligne a ete supprimee entre
     * temps : on ne recree rien, l'absence est deja tracee par le log ci-dessus.
     */
    private void settle(Long requestId, MailStatus status) {
        repository.findById(requestId).ifPresent(request -> {
            request.setMailStatus(status);
            request.setMailSettledAt(Instant.now());
            repository.save(request);
        });
    }

    private String subjectFor(ContactSubmission submission) {
        String origin = isFilled(submission.company())
                ? submission.name() + " (" + submission.company() + ")"
                : submission.name();
        return "Demande de contact, " + origin;
    }

    /**
     * Corps en texte brut, dans l'ordre du formulaire.
     *
     * <p>Texte et non HTML : le message est lu dans une boite, pas mis en page,
     * et le texte brut ne pose ni question d'echappement ni de rendu client.
     */
    private String bodyFor(ContactSubmission submission) {
        return Stream.of(
                        "Nom : " + submission.name(),
                        "Email : " + submission.email(),
                        line("Entreprise", submission.company()),
                        "Type de projet : " + submission.projectType(),
                        line("Budget envisage", submission.budget()),
                        line("Echeance", submission.deadline()),
                        "",
                        submission.message())
                .filter(java.util.Objects::nonNull)
                .reduce((a, b) -> a + "\n" + b)
                .orElse("");
    }

    /** Ligne omise plutot qu'affichee vide quand le champ facultatif est absent. */
    private String line(String label, String value) {
        return isFilled(value) ? label + " : " + value : null;
    }

    private boolean isFilled(String value) {
        return value != null && !value.isBlank();
    }
}
