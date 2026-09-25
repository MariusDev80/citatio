package com.citatio.u2blog.article;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Article tel qu'il arrive du formulaire de redaction, sans son image.
 *
 * <p>L'image voyage dans une autre partie de la meme requete multipart : un
 * fichier de 2 Mo encode en base64 dans le JSON pese un tiers de plus et passe
 * par Jackson pour rien.
 *
 * <p>Les bornes sont celles des colonnes de {@code V1__articles.sql}. Les
 * depasser ici rendrait un 500 a l'insertion au lieu d'un 400 lisible.
 *
 * @param categories une a trois rubriques. Une valeur inconnue fait echouer la
 *                   lecture du JSON, donc un 400 avant meme la validation.
 * @param imageAlt   texte alternatif de l'image. Obligatoire quand une image
 *                   est jointe, ce que le service verifie : la contrainte
 *                   porte sur deux parties de la requete, pas sur ce record.
 */
public record ArticleDraft(

        @NotBlank(message = "le titre est obligatoire")
        @Size(min = 5, max = 140, message = "le titre doit faire entre 5 et 140 caracteres")
        String title,

        @NotBlank(message = "le chapeau est obligatoire")
        @Size(min = 20, max = 300, message = "le chapeau doit faire entre 20 et 300 caracteres")
        String excerpt,

        @NotBlank(message = "le texte est obligatoire")
        @Size(min = 50, max = 50000, message = "le texte doit faire entre 50 et 50 000 caracteres")
        String body,

        @NotBlank(message = "l'auteur est obligatoire")
        @Size(min = 2, max = 80, message = "l'auteur doit faire entre 2 et 80 caracteres")
        String author,

        // @NotEmpty refuse aussi null : un @NotNull en plus doublait le message.
        @NotEmpty(message = "au moins une rubrique est obligatoire")
        @Size(max = 3, message = "trois rubriques au plus")
        List<@NotNull(message = "rubrique vide") ArticleCategory> categories,

        @Size(max = 200, message = "le texte alternatif depasse 200 caracteres")
        String imageAlt) {

    /** Texte alternatif renseigne, espaces seuls exclus. */
    public boolean hasImageAlt() {
        return imageAlt != null && !imageAlt.isBlank();
    }
}
