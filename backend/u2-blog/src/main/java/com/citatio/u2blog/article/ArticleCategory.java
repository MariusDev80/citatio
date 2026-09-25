package com.citatio.u2blog.article;

/**
 * Rubriques du blog.
 *
 * <p>Liste fermee plutot que mots-cles libres : trois auteurs qui tapent
 * "SEO", "Seo" et "referencement" produiraient trois rubriques pour un seul
 * sujet, et un filtre par rubrique deviendrait inutilisable. Les rubriques
 * suivent les offres du site, plus une pour la vie de l'agence.
 *
 * <p>Le libelle est ici et non dans le frontend : le serveur est la seule
 * source de la liste (voir {@code GET /api/u2/article-categories}), le
 * formulaire et les pages l'affichent sans la recopier.
 *
 * <p>Stocke par son nom en base : renommer une constante demande une
 * migration, changer un libelle non.
 */
public enum ArticleCategory {

    SITE_VITRINE("Site vitrine"),
    SEO("Référencement"),
    GEO("Visibilité IA"),
    HEBERGEMENT("Hébergement"),
    AGENCE("Vie de l'agence");

    private final String label;

    ArticleCategory(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
