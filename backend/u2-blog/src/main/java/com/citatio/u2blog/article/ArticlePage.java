package com.citatio.u2blog.article;

import java.util.List;

/**
 * Une page de la liste des articles.
 *
 * <p>Record dedie plutot que {@code Page<T>} serialise tel quel : le format
 * JSON de {@code PageImpl} n'est pas un contrat stable (Spring Data le signale
 * lui-meme a chaque serialisation), et le frontend n'a besoin que de ces cinq
 * champs.
 */
public record ArticlePage(
        List<ArticleSummary> items,
        int page,
        int size,
        long totalItems,
        int totalPages) {
}
