package com.citatio.u2blog.article;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;

/**
 * Fabrication de l'adresse d'un article a partir de son titre.
 *
 * <p>Les URL du site sont en francais et descriptives (CLAUDE.md §6.3) : un
 * article s'ouvre sur {@code /blog/combien-coute-un-site-vitrine}, pas sur
 * {@code /blog/42}. Les accents sont retires plutot qu'encodes, une adresse
 * en {@code %C3%A9} se lit mal une fois copiee dans un message.
 */
final class ArticleSlugs {

    /** Longueur maximale, suffixe de deduplication compris (colonne de 90). */
    static final int MAX_LENGTH = 80;

    /**
     * Adresses deja prises par des routes du frontend sous {@code /blog}. Un
     * article qui s'appellerait "Nouvel article" masquerait sinon le formulaire
     * de redaction, ou l'inverse selon l'ordre des routes Angular.
     */
    static final Set<String> RESERVED = Set.of("nouvel-article");

    private static final String FALLBACK = "article";

    private ArticleSlugs() {
    }

    static String fromTitle(String title) {
        String ascii = Normalizer.normalize(title, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                // Ligatures que NFD ne decompose pas, frequentes en francais.
                .replace("œ", "oe").replace("Œ", "oe")
                .replace("æ", "ae").replace("Æ", "ae")
                .toLowerCase(Locale.ROOT);

        String slug = ascii.replaceAll("[^a-z0-9]+", "-").replaceAll("(^-+)|(-+$)", "");
        if (slug.length() > MAX_LENGTH) {
            // Coupe au dernier tiret pour ne pas laisser un mot tronque.
            String cut = slug.substring(0, MAX_LENGTH);
            int lastDash = cut.lastIndexOf('-');
            slug = lastDash > 0 ? cut.substring(0, lastDash) : cut;
        }
        return slug.isEmpty() ? FALLBACK : slug;
    }
}
