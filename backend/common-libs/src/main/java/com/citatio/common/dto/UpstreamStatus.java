package com.citatio.common.dto;

/**
 * Resultat d'un appel inter-modules (u1 -> u2 ou u2 -> u1).
 *
 * <p>L'indisponibilite de l'upstream est encodee <b>dans la reponse</b> plutot que
 * remontee en exception : un microservice doit continuer a repondre meme si son
 * voisin est coupe. C'est la brique qui garantit l'independance des services.
 *
 * <p>La cause de l'echec est un <b>motif ferme</b> et non le message de
 * l'exception. Une premiere version renvoyait {@code e.getMessage()}, ce qui
 * publiait sur un endpoint accessible depuis Internet la topologie interne :
 * {@code I/O error on GET request for "http://u2-blog:8082/api/u2/health"}.
 * Le message complet part desormais dans les logs, ou il est utile, et la
 * reponse ne porte que le motif, qui suffit a diagnostiquer.
 *
 * @param service nom du microservice appele (ex: "u1-communication")
 * @param state   joignable ou non
 * @param payload reponse de sante de l'upstream, {@code null} s'il est injoignable
 * @param reason  motif de l'echec, {@code null} si l'appel a reussi
 */
public record UpstreamStatus(String service, State state, HealthResponse payload, FailureReason reason) {

    /** Etat de la liaison vers le voisin. */
    public enum State {

        /** L'upstream a repondu. */
        REACHABLE,

        /** L'upstream n'a pas repondu (coupe, timeout, ou erreur HTTP). */
        UNREACHABLE
    }

    /**
     * Motif d'echec, volontairement grossier : il renseigne l'exploitant sans
     * decrire l'infrastructure. Le detail technique reste dans les logs.
     */
    public enum FailureReason {

        /** Connexion impossible : service arrete, port ferme, nom non resolu. */
        CONNECTION_FAILED,

        /** L'upstream n'a pas repondu dans le budget de temps imparti. */
        TIMEOUT,

        /** L'upstream a repondu, mais avec un statut 4xx ou 5xx. */
        HTTP_ERROR,

        /** L'upstream a repondu quelque chose d'illisible (corps ou type inattendu). */
        INVALID_RESPONSE,

        /**
         * Le disjoncteur est ouvert : l'appel n'a meme pas ete tente, parce que
         * l'upstream vient d'echouer de maniere repetee. Ce n'est pas une panne
         * de plus, c'est le refus delibere de repayer le timeout.
         */
        CIRCUIT_OPEN
    }

    /** Appel reussi : on transporte la reponse de l'upstream. */
    public static UpstreamStatus reachable(String service, HealthResponse payload) {
        return new UpstreamStatus(service, State.REACHABLE, payload, null);
    }

    /** Appel echoue : le service appelant reste fonctionnel, en mode degrade. */
    public static UpstreamStatus unreachable(String service, FailureReason reason) {
        return new UpstreamStatus(service, State.UNREACHABLE, null, reason);
    }
}
