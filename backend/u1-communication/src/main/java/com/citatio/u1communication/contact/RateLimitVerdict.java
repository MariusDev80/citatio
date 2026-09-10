package com.citatio.u1communication.contact;

import java.time.Duration;

/**
 * Reponse du limiteur : la demande passe, ou bien elle est refusee et l'on sait
 * dans combien de temps un creneau se libere.
 *
 * <p>Le delai n'est pas un detail de confort. Un refus qui ne dit pas quand
 * reessayer oblige le visiteur a deviner, et c'est exactement ce que la page
 * affichait : "votre message n'est pas parti", sans cause ni suite.
 *
 * @param allowed    vrai si la demande consomme un creneau
 * @param retryAfter temps restant avant le prochain creneau, {@link Duration#ZERO}
 *                   quand la demande passe
 */
public record RateLimitVerdict(boolean allowed, Duration retryAfter) {

    /** Nommee `granted` et non `allowed` : ce dernier est deja l'accesseur du record. */
    static RateLimitVerdict granted() {
        return new RateLimitVerdict(true, Duration.ZERO);
    }

    static RateLimitVerdict refused(Duration retryAfter) {
        // Jamais zero seconde sur un refus : un Retry-After a 0 se lit comme
        // "reessayez tout de suite", ce qui redonnerait un refus immediat.
        Duration wait = retryAfter.isNegative() || retryAfter.isZero()
                ? Duration.ofSeconds(1)
                : retryAfter;
        return new RateLimitVerdict(false, wait);
    }
}
