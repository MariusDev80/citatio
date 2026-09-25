package com.citatio.u2blog.article;

import java.time.Instant;
import java.util.List;

/**
 * Article complet, pour sa page.
 *
 * @param body texte brut tel que saisi. La mise en forme (paragraphes,
 *             intertitres, listes) est interpretee par le frontend, qui ne
 *             l'insere jamais comme HTML.
 */
public record ArticleDetail(
        String slug,
        String title,
        String excerpt,
        String body,
        String author,
        Instant publishedAt,
        List<CategoryView> categories,
        String imageUrl,
        String imageAlt) {
}
