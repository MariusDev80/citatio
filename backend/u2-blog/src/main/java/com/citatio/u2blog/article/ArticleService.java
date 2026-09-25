package com.citatio.u2blog.article;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.stream.IntStream;

/**
 * Publication et lecture des articles.
 *
 * <p>Chaque methode porte sa transaction : {@code open-in-view} est coupe, la
 * traduction en records (qui touche les rubriques paresseuses) doit donc se
 * faire ici, et non dans le controleur.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleService {

    /** Taille de page par defaut et plafond : au-dela, une page n'est plus une page. */
    static final int DEFAULT_PAGE_SIZE = 12;
    static final int MAX_PAGE_SIZE = 50;

    private final ArticleRepository articles;
    private final ArticleImageRepository images;
    private final Clock clock;

    @Transactional(readOnly = true)
    public ArticlePage list(int page, int size, String query) {
        // Bornes ramenees plutot que refusees : une page negative ou une taille
        // de 10 000 viennent d'une URL bricolee, pas d'un usage a signaler.
        int safePage = Math.max(0, page);
        int safeSize = Math.clamp(size, 1, MAX_PAGE_SIZE);
        PageRequest pageRequest = PageRequest.of(safePage, safeSize);

        Page<Article> result = ArticleSearch.likePattern(query)
                .map(pattern -> articles.search(pattern, pageRequest))
                .orElseGet(() -> articles.findAllByOrderByPublishedAtDescIdDesc(pageRequest));
        return new ArticlePage(
                result.map(ArticleViews::summary).getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public ArticleDetail find(String slug) {
        return articles.findBySlug(slug)
                .map(ArticleViews::detail)
                .orElseThrow(ArticleNotFoundException::new);
    }

    @Transactional(readOnly = true)
    public ArticleImageView image(String slug) {
        Article article = articles.findBySlug(slug)
                .filter(Article::hasImage)
                .orElseThrow(ArticleNotFoundException::new);
        return images.findById(article.getId())
                .map(image -> new ArticleImageView(image.getContent(), article.getImageContentType()))
                .orElseThrow(ArticleNotFoundException::new);
    }

    /**
     * Publie un article, avec ou sans image.
     *
     * <p>Article et image dans la meme transaction : un article dont l'image
     * n'aurait pas ete ecrite annoncerait une {@code imageUrl} en 404.
     *
     * @param image octets de l'image jointe, ou null sans image
     */
    @Transactional
    public ArticleDetail publish(ArticleDraft draft, byte[] image) {
        ImageFormat format = image == null ? null : checkImage(draft, image);

        Article saved = articles.save(
                Article.publish(draft, availableSlug(draft.title()), format, Instant.now(clock)));
        if (format != null) {
            images.save(new ArticleImage(saved.getId(), image));
        }

        log.info("Article {} publie ({})", saved.getId(), saved.getSlug());
        return ArticleViews.detail(saved);
    }

    private static ImageFormat checkImage(ArticleDraft draft, byte[] image) {
        ImageFormat format = ImageFormat.detect(image).orElseThrow(() ->
                new InvalidArticleException("l'image doit etre au format JPEG, PNG ou WebP"));
        // Sans texte alternatif, l'image est muette pour un lecteur d'ecran :
        // le site vend l'accessibilite AA, il ne publie pas ce qu'il reproche.
        if (!draft.hasImageAlt()) {
            throw new InvalidArticleException("le texte alternatif est obligatoire avec une image");
        }
        return format;
    }

    /**
     * Adresse libre derivee du titre : {@code titre}, puis {@code titre-2},
     * {@code titre-3}...
     *
     * <p>Deux publications simultanees du meme titre peuvent encore viser la
     * meme adresse ; la contrainte unique de la base refuse alors la seconde.
     * A trois auteurs, ce cas ne justifie pas de verrou.
     */
    private String availableSlug(String title) {
        String base = ArticleSlugs.fromTitle(title);
        return IntStream.iterate(1, n -> n + 1)
                .mapToObj(n -> n == 1 ? base : base + "-" + n)
                .filter(candidate -> !ArticleSlugs.RESERVED.contains(candidate))
                .filter(candidate -> !articles.existsBySlug(candidate))
                .findFirst()
                .orElseThrow();
    }
}
