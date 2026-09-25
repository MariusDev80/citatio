package com.citatio.u2blog.article;

import java.time.Instant;
import java.util.List;

/**
 * Article dans une liste : tout sauf le texte, qui peut peser 50 000
 * caracteres et que la liste n'affiche pas.
 *
 * @param imageUrl chemin de l'image, relatif a la gateway, ou null sans image
 */
public record ArticleSummary(
        String slug,
        String title,
        String excerpt,
        String author,
        Instant publishedAt,
        List<CategoryView> categories,
        String imageUrl,
        String imageAlt) {
}
