package com.citatio.u2blog.article;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/** Acces aux articles. Aucune jointure hors de citatio_u2_db. */
public interface ArticleRepository extends JpaRepository<Article, Long> {

    /** Du plus recent au plus ancien ; l'identifiant departage deux publications simultanees. */
    Page<Article> findAllByOrderByPublishedAtDescIdDesc(Pageable pageable);

    /**
     * Articles dont le titre ou le chapeau contient le motif, meme ordre que la
     * liste complete. Le texte n'est pas parcouru : 50 000 caracteres par ligne
     * pour un resultat que le lecteur juge sur le titre.
     *
     * @param pattern motif deja normalise et echappe par {@link ArticleSearch}
     */
    // cast(... as String) : translate n'est pas une fonction que Hibernate
    // connait, il n'en devine pas le type et refuse alors de lui appliquer like.
    @Query("select a from Article a"
            + " where cast(function('translate', lower(a.title), '" + ArticleSearch.ACCENTED + "', '"
            + ArticleSearch.PLAIN + "') as String) like :pattern escape '\\'"
            + " or cast(function('translate', lower(a.excerpt), '" + ArticleSearch.ACCENTED + "', '"
            + ArticleSearch.PLAIN + "') as String) like :pattern escape '\\'"
            + " order by a.publishedAt desc, a.id desc")
    Page<Article> search(@Param("pattern") String pattern, Pageable pageable);

    Optional<Article> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
