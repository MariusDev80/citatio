package com.citatio.u2blog.article;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Optional;

/**
 * Recherche dans les articles, insensible a la casse et aux accents.
 *
 * <p>Un lecteur tape "cout" ou "referencement" bien plus souvent que "coût" ou
 * "référencement" : une recherche sensible aux accents ne trouverait presque
 * rien en francais. Les deux cotes sont donc ramenes a la meme forme, le texte
 * saisi ici en Java, les colonnes en SQL par {@code translate}.
 *
 * <p>{@code translate} plutot que l'extension {@code unaccent} de Postgres :
 * elle n'existe pas dans H2, et les tests rejouent les requetes sur H2. Une
 * colonne normalisee stockee aurait demande une migration et un rattrapage des
 * lignes existantes, pour un blog de quelques dizaines d'articles au plus.
 * Limite connue : une ligature ("œ") ne devient pas deux lettres en SQL, un
 * titre en "œuvre" ne sort pas sur "oeuvre".
 */
final class ArticleSearch {

    /**
     * Lettres accentuees et leur equivalent sans accent, dans le meme ordre.
     * Minuscules seulement : la colonne passe par {@code lower} avant.
     * Constantes de compilation, pour pouvoir entrer dans l'annotation @Query.
     */
    static final String ACCENTED = "àâäáãåéèêëíìîïóòôöõúùûüýÿçñ";
    static final String PLAIN = "aaaaaaeeeeiiiiooooouuuuyycn";

    /** Au-dela, ce n'est plus une recherche mais un texte colle. */
    static final int MAX_LENGTH = 100;

    private ArticleSearch() {
    }

    /**
     * Motif {@code LIKE} a comparer aux colonnes normalisees, ou vide si la
     * saisie ne contient rien a chercher.
     *
     * <p>Les jokers de {@code LIKE} sont echappes : un "%" tape par le lecteur
     * cherche un signe pourcentage, il ne doit pas renvoyer toute la table.
     */
    static Optional<String> likePattern(String query) {
        if (query == null || query.isBlank()) {
            return Optional.empty();
        }
        String trimmed = query.strip();
        String bounded = trimmed.length() > MAX_LENGTH ? trimmed.substring(0, MAX_LENGTH) : trimmed;
        String normalized = Normalizer.normalize(bounded, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
        String escaped = normalized
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return Optional.of("%" + escaped + "%");
    }
}
