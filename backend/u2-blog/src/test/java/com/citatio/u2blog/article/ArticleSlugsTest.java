package com.citatio.u2blog.article;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ArticleSlugsTest {

    @Test
    @DisplayName("Accents retires, ponctuation remplacee par des tirets")
    void stripsAccentsAndPunctuation() {
        assertThat(ArticleSlugs.fromTitle("Combien coûte un site vitrine, en 2026 ?"))
                .isEqualTo("combien-coute-un-site-vitrine-en-2026");
    }

    @Test
    @DisplayName("Ligatures et apostrophes typographiques")
    void handlesLigaturesAndApostrophes() {
        assertThat(ArticleSlugs.fromTitle("L’œuvre d’un artisan"))
                .isEqualTo("l-oeuvre-d-un-artisan");
    }

    @Test
    @DisplayName("Titre trop long : coupe au dernier mot entier")
    void cutsLongTitlesOnAWordBoundary() {
        String slug = ArticleSlugs.fromTitle("mot ".repeat(40));

        assertThat(slug).hasSizeLessThanOrEqualTo(ArticleSlugs.MAX_LENGTH);
        assertThat(slug).doesNotEndWith("-").endsWith("mot");
    }

    @Test
    @DisplayName("Titre sans lettre ni chiffre : adresse de repli")
    void fallsBackWhenNothingIsLeft() {
        assertThat(ArticleSlugs.fromTitle("?!… ---")).isEqualTo("article");
    }
}
