package com.citatio.u2blog.api;

import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/**
 * Contrat HTTP du blog, de la requete a la base.
 *
 * <p>Contexte complet sur H2 plutot qu'un {@code @WebMvcTest} : la migration
 * Flyway est rejouee et validee par Hibernate au demarrage, donc une colonne
 * mal nommee ou mal typee fait echouer ce test avant le deploiement.
 * Chaque test est annule a la fin ({@code @Transactional}).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ArticleApiTest {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0, 0, 0, 13};

    @Autowired
    private MockMvc mockMvc;

    private static String draft(String title, String imageAlt) {
        String alt = imageAlt == null ? "null" : "\"" + imageAlt + "\"";
        return """
                {
                  "title": "%s",
                  "excerpt": "Ce que coute un site vitrine, poste par poste.",
                  "body": "Un site vitrine se paie une fois, puis s'heberge chaque mois. Voici le detail.",
                  "author": "Marius Dudouet",
                  "categories": ["SEO", "SITE_VITRINE"],
                  "imageAlt": %s
                }
                """.formatted(title, alt);
    }

    private static MockMultipartFile articlePart(String json) {
        return new MockMultipartFile("article", "", MediaType.APPLICATION_JSON_VALUE,
                json.getBytes(StandardCharsets.UTF_8));
    }

    private static MockMultipartFile imagePart(byte[] content) {
        return new MockMultipartFile("image", "couverture.png", MediaType.IMAGE_PNG_VALUE, content);
    }

    private ResultActions publish(String json, MockMultipartFile... extra) throws Exception {
        var request = multipart("/api/u2/articles").file(articlePart(json));
        Arrays.stream(extra).forEach(request::file);
        return mockMvc.perform(request);
    }

    @Nested
    class Publication {

        @Test
        @DisplayName("Article sans image : 201, Location et adresse derivee du titre")
        void publishesWithoutImage() throws Exception {
            publish(draft("Combien coûte un site vitrine ?", null))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", "/api/u2/articles/combien-coute-un-site-vitrine"))
                    .andExpect(jsonPath("$.slug").value("combien-coute-un-site-vitrine"))
                    .andExpect(jsonPath("$.imageUrl").value(nullValue()))
                    .andExpect(jsonPath("$.publishedAt").isNotEmpty());
        }

        @Test
        @DisplayName("Rubriques rendues dans l'ordre de l'enum, avec leur libelle")
        void returnsCategoriesInEnumOrder() throws Exception {
            publish(draft("Rubriques dans l'ordre", null))
                    .andExpect(jsonPath("$.categories[0].code").value("SITE_VITRINE"))
                    .andExpect(jsonPath("$.categories[0].label").value("Site vitrine"))
                    .andExpect(jsonPath("$.categories[1].code").value("SEO"));
        }

        @Test
        @DisplayName("Meme titre deux fois : la seconde adresse recoit un suffixe")
        void deduplicatesSlugs() throws Exception {
            publish(draft("Un titre en double", null)).andExpect(status().isCreated());
            publish(draft("Un titre en double", null))
                    .andExpect(jsonPath("$.slug").value("un-titre-en-double-2"));
        }

        @Test
        @DisplayName("Un titre qui donnerait l'adresse du formulaire est deplace")
        void avoidsReservedSlugs() throws Exception {
            publish(draft("Nouvel article", null))
                    .andExpect(jsonPath("$.slug").value("nouvel-article-2"));
        }

        @Test
        @DisplayName("Avec image : servie ensuite sous son vrai type, avec cache")
        void publishesAndServesImage() throws Exception {
            publish(draft("Article illustre", "Vitrine d'une boulangerie"), imagePart(PNG))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.imageUrl").value("/api/u2/articles/article-illustre/image"))
                    .andExpect(jsonPath("$.imageAlt").value("Vitrine d'une boulangerie"));

            mockMvc.perform(get("/api/u2/articles/article-illustre/image"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.IMAGE_PNG))
                    .andExpect(header().string("Cache-Control", "max-age=86400, public"))
                    .andExpect(content().bytes(PNG));
        }

        @Test
        @DisplayName("Champ fichier vide : article publie sans image")
        void emptyFilePartMeansNoImage() throws Exception {
            publish(draft("Fichier vide", null), imagePart(new byte[0]))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.imageUrl").value(nullValue()));
        }

        @Test
        @DisplayName("Fichier qui n'est pas une image : 400")
        void rejectsNonImageFiles() throws Exception {
            byte[] svg = "<svg/>".getBytes(StandardCharsets.UTF_8);

            publish(draft("Image piegee", "Texte"), imagePart(svg))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.detail").value("l'image doit etre au format JPEG, PNG ou WebP"));
        }

        @Test
        @DisplayName("Image sans texte alternatif : 400")
        void requiresAltTextWithImage() throws Exception {
            publish(draft("Image muette", "  "), imagePart(PNG))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.detail").value("le texte alternatif est obligatoire avec une image"));
        }

        @Test
        @DisplayName("Champs invalides : 400 en Problem Details, champ nomme")
        void rejectsInvalidDraft() throws Exception {
            publish("""
                    {"title": "Hop", "excerpt": "", "body": "", "author": "", "categories": []}
                    """)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("title")));
        }

        @Test
        @DisplayName("Rubrique inconnue : 400, pas 500")
        void rejectsUnknownCategory() throws Exception {
            publish(draft("Rubrique inconnue", null).replace("\"SEO\"", "\"CUISINE\""))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    class Lecture {

        @Test
        @DisplayName("Liste : du plus recent au plus ancien, sans le texte")
        void listsNewestFirst() throws Exception {
            publish(draft("Premier article", null));
            publish(draft("Second article", null));

            mockMvc.perform(get("/api/u2/articles"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalItems").value(2))
                    .andExpect(jsonPath("$.items[0].slug").value("second-article"))
                    .andExpect(jsonPath("$.items[1].slug").value("premier-article"))
                    .andExpect(jsonPath("$.items[0].body").doesNotExist());
        }

        @Test
        @DisplayName("Liste : taille de page plafonnee, page negative ramenee a zero")
        void clampsPaging() throws Exception {
            mockMvc.perform(get("/api/u2/articles").param("page", "-3").param("size", "10000"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.page").value(0))
                    .andExpect(jsonPath("$.size").value(50));
        }

        @Test
        @DisplayName("Article : texte complet")
        void returnsDetail() throws Exception {
            publish(draft("Article complet", null));

            mockMvc.perform(get("/api/u2/articles/article-complet"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Article complet"))
                    .andExpect(jsonPath("$.body").value(endsWith("Voici le detail.")));
        }

        @Test
        @DisplayName("Adresse inconnue : 404 en Problem Details")
        void unknownSlugAnswers404() throws Exception {
            mockMvc.perform(get("/api/u2/articles/n-existe-pas"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404));
        }

        @Test
        @DisplayName("Image d'un article qui n'en a pas : 404")
        void missingImageAnswers404() throws Exception {
            publish(draft("Sans illustration", null));

            mockMvc.perform(get("/api/u2/articles/sans-illustration/image"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Rubriques : liste complete, codes et libelles")
        void listsCategories() throws Exception {
            mockMvc.perform(get("/api/u2/article-categories"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(5))
                    .andExpect(jsonPath("$[0].code").value("SITE_VITRINE"))
                    .andExpect(jsonPath("$[2].label").value("Visibilité IA"));
        }
    }

    @Nested
    class Recherche {

        private ResultActions search(String q) throws Exception {
            return mockMvc.perform(get("/api/u2/articles").param("q", q));
        }

        @Test
        @DisplayName("Sans accents ni majuscules, trouve un titre accentue")
        void ignoresCaseAndAccents() throws Exception {
            // Mot absent du chapeau commun aux brouillons de test.
            publish(draft("Le référencement local expliqué", null));
            publish(draft("Un autre sujet", null));

            search("REFERENCEMENT")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalItems").value(1))
                    .andExpect(jsonPath("$.items[0].slug").value("le-referencement-local-explique"));
        }

        @Test
        @DisplayName("Cherche aussi dans le chapeau")
        void searchesTheExcerpt() throws Exception {
            publish(draft("Titre sans rapport", null));

            // Le chapeau des brouillons de test : "Ce que coute un site vitrine, poste par poste."
            search("poste par poste")
                    .andExpect(jsonPath("$.totalItems").value(1));
        }

        @Test
        @DisplayName("Un % tape par le lecteur ne renvoie pas toute la table")
        void percentIsLiteral() throws Exception {
            publish(draft("Un article ordinaire", null));

            search("%").andExpect(jsonPath("$.totalItems").value(0));
        }

        @Test
        @DisplayName("Aucun resultat : page vide, pas d'erreur")
        void noMatchIsAnEmptyPage() throws Exception {
            publish(draft("Un article ordinaire", null));

            search("introuvable")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.items.length()").value(0))
                    .andExpect(jsonPath("$.totalPages").value(0));
        }

        @Test
        @DisplayName("Recherche vide : tous les articles")
        void blankQueryListsEverything() throws Exception {
            publish(draft("Premier", null));
            publish(draft("Deuxieme", null));

            search("  ").andExpect(jsonPath("$.totalItems").value(2));
        }
    }
}
