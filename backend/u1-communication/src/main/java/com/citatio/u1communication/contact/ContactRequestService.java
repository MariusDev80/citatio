package com.citatio.u1communication.contact;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Prise en charge d'une demande de contact : enregistrer, puis prevenir.
 *
 * <p>Cet ordre est la seule garantie du dispositif. Le mail peut echouer, le
 * SMTP peut etre coupe ou mal configure ; ce qui ne doit jamais arriver, c'est
 * qu'un prospect ait ecrit et qu'il n'en reste aucune trace.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContactRequestService {

    private final ContactRequestRepository repository;
    private final ContactNotifier notifier;

    /**
     * Enregistre la demande et declenche la notification.
     *
     * <p>Volontairement <b>sans {@code @Transactional}</b> : la notification est
     * asynchrone et va relire la ligne pour y inscrire le statut d'envoi. Dans
     * une transaction ouverte ici, elle chercherait une ligne pas encore
     * commitee et ne la trouverait pas. {@code save} porte sa propre
     * transaction, la ligne est donc commitee avant que le thread d'envoi parte.
     *
     * @return l'identifiant de la demande enregistree, ou {@code null} si la
     *         soumission a ete ecartee comme automatisee
     */
    public Long submit(ContactSubmission submission, String clientIp) {
        if (submission.looksAutomated()) {
            // Rien en base, rien par mail, et surtout rien qui le dise au client :
            // le controleur repond 202 comme pour une demande normale. Une erreur
            // explicite apprendrait au robot quel champ eviter au prochain envoi.
            log.info("Demande de contact ecartee, leurre rempli (ip {})", clientIp);
            return null;
        }

        ContactRequest saved = repository.save(
                ContactRequest.received(submission, clientIp, Instant.now()));
        log.info("Demande de contact {} enregistree", saved.getId());

        notifier.notifyTeam(saved.getId(), submission);
        return saved.getId();
    }
}
