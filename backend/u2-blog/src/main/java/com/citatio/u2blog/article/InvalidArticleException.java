package com.citatio.u2blog.article;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Article refuse pour une regle que {@code @Valid} ne sait pas exprimer :
 * celles qui portent sur l'image, envoyee dans une autre partie de la requete
 * que le JSON. Rendu en 400, comme un echec de validation ordinaire.
 */
public class InvalidArticleException extends ResponseStatusException {

    public InvalidArticleException(String reason) {
        super(HttpStatus.BAD_REQUEST, reason);
    }
}
