package com.citatio.u1communication.contact;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

/**
 * Quota horaire atteint pour cette IP.
 *
 * <p>Herite de {@link ResponseStatusException} pour rester dans le circuit
 * d'erreurs existant : {@code ApiExceptionHandler} en tire un Problem Details
 * 429 sans code supplementaire, et reprend les en-tetes rendus ci-dessous.
 *
 * <p>Le {@code Retry-After} n'est pas decoratif : c'est la seule facon pour le
 * navigateur d'annoncer au visiteur quand il pourra renvoyer son message. Sans
 * lui, la page ne pourrait dire que "reessayez plus tard", ce qui est
 * precisement le message inutile qu'on cherche a remplacer.
 */
public class ContactRateLimitExceededException extends ResponseStatusException {

    private final Duration retryAfter;

    public ContactRateLimitExceededException(Duration retryAfter) {
        // Le detail reste vague sur le seuil exact : le publier aiderait a le
        // contourner. Le delai, lui, est utile au visiteur legitime.
        super(HttpStatus.TOO_MANY_REQUESTS,
                "Trop de demandes envoyees depuis cette connexion. Reessayez plus tard.");
        this.retryAfter = retryAfter;
    }

    /**
     * En-tetes joints a la reponse d'erreur.
     *
     * <p>{@code ResponseEntityExceptionHandler} appelle cette methode et recopie
     * ce qu'elle renvoie : c'est le point d'extension prevu, il n'y a pas besoin
     * d'un advice dedie dans le module.
     */
    @Override
    public HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        // RFC 9110 : Retry-After en secondes (l'autre forme, une date HTTP,
        // obligerait le client a faire confiance a l'horloge du serveur).
        headers.add(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter.toSeconds()));
        return headers;
    }
}
