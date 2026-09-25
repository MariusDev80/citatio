package com.citatio.u2blog.article;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** Acces aux articles. Aucune jointure hors de citatio_u2_db. */
public interface ArticleRepository extends JpaRepository<Article, Long> {

    /** Du plus recent au plus ancien ; l'identifiant departage deux publications simultanees. */
    Page<Article> findAllByOrderByPublishedAtDescIdDesc(Pageable pageable);

    Optional<Article> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
