package com.citatio.u2blog.article;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ArticleSearchTest {

    @Test
    @DisplayName("Saisie vide ou blanche : pas de recherche")
    void blankMeansNoSearch() {
        assertThat(ArticleSearch.likePattern(null)).isEmpty();
        assertThat(ArticleSearch.likePattern("   ")).isEmpty();
    }

    @Test
    @DisplayName("Majuscules et accents ramenes a la forme des colonnes")
    void normalizesCaseAndAccents() {
        assertThat(ArticleSearch.likePattern("  Référencement ")).contains("%referencement%");
    }

    @Test
    @DisplayName("Les jokers LIKE tapes par le lecteur sont cherches tels quels")
    void escapesLikeWildcards() {
        assertThat(ArticleSearch.likePattern("100%_net\\")).contains("%100\\%\\_net\\\\%");
    }

    @Test
    @DisplayName("Saisie trop longue : bornee")
    void boundsLength() {
        assertThat(ArticleSearch.likePattern("a".repeat(500)).orElseThrow())
                .hasSize(ArticleSearch.MAX_LENGTH + 2);
    }

    @Test
    @DisplayName("Les deux alphabets de translate ont la meme longueur")
    void translateAlphabetsAreAligned() {
        // Decales d'un caractere, translate associerait chaque accent a la
        // mauvaise lettre, sans erreur visible.
        assertThat(ArticleSearch.PLAIN).hasSameSizeAs(ArticleSearch.ACCENTED);
    }
}
