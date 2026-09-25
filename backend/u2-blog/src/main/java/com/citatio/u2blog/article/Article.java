package com.citatio.u2blog.article;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Article du blog, persiste dans {@code citatio_u2_db}.
 *
 * <p>Jamais expose tel quel (CLAUDE.md §4.2) : {@link ArticleViews} le traduit
 * en records de reponse. Aucun setter : un article publie ne change pas
 * encore, la modification viendra avec son propre point d'entree.
 *
 * <p>Schema porte par {@code V1__articles.sql}, verifie par Hibernate au
 * demarrage ({@code ddl-auto=validate}).
 */
@Entity
@Table(name = "article")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 90, unique = true)
    private String slug;

    @Column(nullable = false, length = 140)
    private String title;

    @Column(nullable = false, length = 300)
    private String excerpt;

    @Column(nullable = false, length = 50000)
    private String body;

    @Column(nullable = false, length = 80)
    private String author;

    @Column(name = "image_alt", length = 200)
    private String imageAlt;

    /** Type MIME des octets stockes, detecte a l'envoi. Null sans image. */
    @Column(name = "image_content_type", length = 20)
    private String imageContentType;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt;

    /**
     * Rubriques, chargees par lots : une page de douze articles coute deux
     * requetes et non treize. Un fetch join aurait fait paginer Hibernate en
     * memoire, sur toute la table.
     */
    @ElementCollection
    @CollectionTable(name = "article_category", joinColumns = @JoinColumn(name = "article_id"))
    @Column(name = "category", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    @BatchSize(size = 50)
    private Set<ArticleCategory> categories = new HashSet<>();

    /**
     * Construit l'article a partir du brouillon valide.
     *
     * <p>Fabrique plutot que setters, comme {@code ContactRequest} : la date de
     * publication et le couple image/texte alternatif sont poses ici, donc
     * impossibles a oublier ou a desassortir.
     *
     * @param imageFormat format de l'image jointe, ou null sans image
     */
    static Article publish(ArticleDraft draft, String slug, ImageFormat imageFormat, Instant now) {
        Article article = new Article();
        article.slug = slug;
        article.title = draft.title().strip();
        article.excerpt = draft.excerpt().strip();
        article.body = draft.body().strip();
        article.author = draft.author().strip();
        article.categories.addAll(draft.categories());
        if (imageFormat != null) {
            article.imageContentType = imageFormat.mediaType();
            article.imageAlt = draft.imageAlt().strip();
        }
        article.publishedAt = now;
        return article;
    }

    public boolean hasImage() {
        return imageContentType != null;
    }

    /** Rubriques dans l'ordre de l'enum, pour un affichage stable d'une page a l'autre. */
    public List<ArticleCategory> sortedCategories() {
        return categories.stream().sorted(Comparator.naturalOrder()).toList();
    }
}
