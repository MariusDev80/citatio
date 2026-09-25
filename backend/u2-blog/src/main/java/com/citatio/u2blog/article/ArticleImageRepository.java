package com.citatio.u2blog.article;

import org.springframework.data.jpa.repository.JpaRepository;

/** Acces aux images, par identifiant d'article. */
public interface ArticleImageRepository extends JpaRepository<ArticleImage, Long> {
}
