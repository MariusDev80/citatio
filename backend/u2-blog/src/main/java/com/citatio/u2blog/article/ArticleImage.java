package com.citatio.u2blog.article;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Octets de l'image de couverture d'un article.
 *
 * <p>Entite a part et sans relation JPA vers {@link Article} : ainsi aucun
 * chargement d'article, paresseux ou non, ne peut tirer 2 Mo par ligne. On la
 * lit seulement quand un navigateur demande l'image.
 */
@Entity
@Table(name = "article_image")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ArticleImage {

    /** Identifiant de l'article, qui sert aussi de cle a son image. */
    @Id
    @Column(name = "article_id")
    private Long articleId;

    @Column(nullable = false)
    private byte[] content;

    ArticleImage(Long articleId, byte[] content) {
        this.articleId = articleId;
        this.content = content;
    }
}
