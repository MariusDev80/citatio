package com.citatio.u2blog.article;

/**
 * Rubrique telle que le frontend la recoit : le code pour l'envoyer, le
 * libelle pour l'afficher.
 */
public record CategoryView(String code, String label) {

    public static CategoryView of(ArticleCategory category) {
        return new CategoryView(category.name(), category.label());
    }
}
