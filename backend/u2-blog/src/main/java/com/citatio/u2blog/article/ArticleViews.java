package com.citatio.u2blog.article;

import java.util.List;

/**
 * Traduction des entites en records de reponse. Appelee dans une transaction
 * ouverte : les rubriques sont chargees paresseusement.
 */
final class ArticleViews {

    private ArticleViews() {
    }

    /**
     * Chemin public de l'image. Relatif, comme toutes les URL que le frontend
     * appelle : le domaine appartient a l'infrastructure, pas au service.
     */
    static String imageUrl(Article article) {
        return article.hasImage() ? "/api/u2/articles/" + article.getSlug() + "/image" : null;
    }

    static ArticleSummary summary(Article article) {
        return new ArticleSummary(
                article.getSlug(),
                article.getTitle(),
                article.getExcerpt(),
                article.getAuthor(),
                article.getPublishedAt(),
                categories(article),
                imageUrl(article),
                article.getImageAlt());
    }

    static ArticleDetail detail(Article article) {
        return new ArticleDetail(
                article.getSlug(),
                article.getTitle(),
                article.getExcerpt(),
                article.getBody(),
                article.getAuthor(),
                article.getPublishedAt(),
                categories(article),
                imageUrl(article),
                article.getImageAlt());
    }

    private static List<CategoryView> categories(Article article) {
        return article.sortedCategories().stream().map(CategoryView::of).toList();
    }
}
