package com.citatio.common.dto;

/**
 * Resultat d'un appel inter-modules (u1 -> u2 ou u2 -> u1).
 *
 * <p>L'indisponibilite de l'upstream est encodee <b>dans la reponse</b> plutot que
 * remontee en exception : un microservice doit continuer a repondre meme si son
 * voisin est coupe. C'est la brique qui garantit l'independance des services.
 *
 * @param service nom du microservice appele (ex: "u1-communication")
 * @param state   {@link #REACHABLE} ou {@link #UNREACHABLE}
 * @param payload reponse de sante de l'upstream, {@code null} s'il est injoignable
 * @param detail  cause de l'echec, {@code null} si l'appel a reussi
 */
public record UpstreamStatus(String service, String state, HealthResponse payload, String detail) {

    /** L'upstream a repondu. */
    public static final String REACHABLE = "REACHABLE";

    /** L'upstream n'a pas repondu (coupe, timeout, ou erreur HTTP). */
    public static final String UNREACHABLE = "UNREACHABLE";

    /** Appel reussi : on transporte la reponse de l'upstream. */
    public static UpstreamStatus reachable(String service, HealthResponse payload) {
        return new UpstreamStatus(service, REACHABLE, payload, null);
    }

    /** Appel echoue : le service appelant reste fonctionnel, en mode degrade. */
    public static UpstreamStatus unreachable(String service, String detail) {
        return new UpstreamStatus(service, UNREACHABLE, null, detail);
    }
}
