package com.citatio.u1communication.contact;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Demande de contact persistee dans {@code citatio_u1_db}.
 *
 * <p><b>Elle est ecrite avant toute tentative d'envoi</b>, et c'est le point
 * important : si le SMTP est coupe, mal configure ou lent, la demande est deja
 * en base. Un prospect perdu ne se rattrape pas, un mail non parti se rejoue.
 *
 * <p>Entite jamais exposee en reponse (CLAUDE.md §4.2) : l'endpoint repond 202
 * sans corps, rien de ce schema ne devient un contrat public.
 *
 * <p>Schema cree par {@code ddl-auto=update}, comme le reste du module. Flyway
 * est la dette assumee de CLAUDE.md §4.2 : c'est la premiere entite reelle du
 * projet, la migration devra etre posee avant qu'une seconde table arrive.
 */
@Entity
@Table(name = "contact_request")
@Getter
@Setter
@NoArgsConstructor
public class ContactRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(length = 160)
    private String company;

    @Column(name = "project_type", nullable = false, length = 80)
    private String projectType;

    @Column(length = 80)
    private String budget;

    @Column(length = 80)
    private String deadline;

    @Column(nullable = false, length = 5000)
    private String message;

    /** Consentement RGPD recueilli. Trace parce qu'il doit pouvoir etre prouve. */
    @Column(nullable = false)
    private boolean consent;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    /**
     * IP de l'emetteur, telle que vue par la gateway. Sert au tri d'abus et a
     * rien d'autre. Colonne large pour absorber une IPv6 complete.
     */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "mail_status", nullable = false, length = 16)
    private MailStatus mailStatus;

    /** Horodatage de l'issue de l'envoi, succes comme echec. Null tant que PENDING. */
    @Column(name = "mail_settled_at")
    private Instant mailSettledAt;

    /**
     * Construit l'entite a partir de la soumission validee.
     *
     * <p>Fabrique plutot que setters en cascade cote service : les champs
     * techniques (date, statut initial) sont poses ici, donc impossibles a
     * oublier sur un futur second point d'entree.
     */
    public static ContactRequest received(ContactSubmission submission, String ipAddress, Instant now) {
        ContactRequest request = new ContactRequest();
        request.name = submission.name();
        request.email = submission.email();
        request.company = submission.company();
        request.projectType = submission.projectType();
        request.budget = submission.budget();
        request.deadline = submission.deadline();
        request.message = submission.message();
        request.consent = submission.consentGiven();
        request.ipAddress = ipAddress;
        request.createdAt = now;
        request.mailStatus = MailStatus.PENDING;
        return request;
    }
}
