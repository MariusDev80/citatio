package com.citatio.u2blog.article;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Aucun article (ou aucune image) a cette adresse.
 *
 * <p>Herite de {@link ResponseStatusException}, comme les exceptions de u1 :
 * {@code ApiExceptionHandler} en fait un Problem Details 404 sans code de plus.
 */
public class ArticleNotFoundException extends ResponseStatusException {

    public ArticleNotFoundException() {
        super(HttpStatus.NOT_FOUND, "Aucun article ne correspond a cette adresse.");
    }
}
