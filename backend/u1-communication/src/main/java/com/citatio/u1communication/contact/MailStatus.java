package com.citatio.u1communication.contact;

/**
 * Etat de la notification email associee a une demande de contact.
 *
 * <p>La demande est enregistree avant toute tentative d'envoi : ce statut dit
 * si le mail est parti, pas si la demande a ete recue. Un {@link #FAILED} se
 * relit donc comme "le lead est en base, personne n'a ete prevenu", ce qui est
 * exactement l'information a avoir sous les yeux quand le SMTP tombe.
 */
public enum MailStatus {

    /** Enregistree, envoi pas encore tente ou en cours (l'envoi est asynchrone). */
    PENDING,

    /** Le serveur SMTP a accepte le message. */
    SENT,

    /** L'envoi a echoue. La demande reste consultable en base, rien n'est perdu. */
    FAILED
}
