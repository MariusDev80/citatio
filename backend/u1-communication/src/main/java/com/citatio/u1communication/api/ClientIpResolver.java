package com.citatio.u1communication.api;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Retrouve l'IP du visiteur derriere la gateway.
 *
 * <p>{@code getRemoteAddr()} seul renvoie l'IP du conteneur Caddy, la meme pour
 * tout le monde : la limite par IP deviendrait une limite globale de 5 demandes
 * par heure pour le site entier.
 *
 * <p><b>On lit la derniere valeur de X-Forwarded-For, pas la premiere.</b>
 * Caddy <i>ajoute</i> l'IP qu'il voit a la fin de l'en-tete existant. Un client
 * qui envoie lui-meme un X-Forwarded-For controle donc les valeurs de gauche et
 * pourrait se donner une IP differente a chaque requete pour contourner la
 * limite ; la derniere, elle, est ecrite par notre propre proxy. Cela vaut tant
 * qu'il y a exactement un intermediaire de confiance, ce qui est le cas ici
 * (Caddy). Ajouter un CDN devant demanderait de revoir ce calcul.
 */
final class ClientIpResolver {

    private static final String FORWARDED_FOR = "X-Forwarded-For";

    /** Assez large pour une IPv6 complete, aligne sur la colonne en base. */
    private static final int MAX_LENGTH = 45;

    private ClientIpResolver() {
    }

    static String resolve(HttpServletRequest request) {
        String forwarded = request.getHeader(FORWARDED_FOR);
        if (forwarded == null || forwarded.isBlank()) {
            return truncate(request.getRemoteAddr());
        }

        String[] hops = forwarded.split(",");
        return truncate(hops[hops.length - 1].trim());
    }

    /**
     * L'en-tete vient du reseau : sa longueur n'est pas garantie, et une valeur
     * trop longue ferait echouer l'insertion en base au lieu d'etre simplement
     * inexploitable.
     */
    private static String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= MAX_LENGTH ? value : value.substring(0, MAX_LENGTH);
    }
}
