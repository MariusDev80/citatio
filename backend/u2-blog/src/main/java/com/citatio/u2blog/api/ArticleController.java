package com.citatio.u2blog.api;

import com.citatio.u2blog.article.ArticleCategory;
import com.citatio.u2blog.article.ArticleDetail;
import com.citatio.u2blog.article.ArticleDraft;
import com.citatio.u2blog.article.ArticleImageView;
import com.citatio.u2blog.article.ArticlePage;
import com.citatio.u2blog.article.ArticleService;
import com.citatio.u2blog.article.CategoryView;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;

/**
 * API du blog.
 *
 * <p>Sous {@code /api/u2}, prefixe conserve par la gateway. La logique vit dans
 * {@link ArticleService} ; ce controleur ne fait que traduire HTTP.
 *
 * <p><b>Aucune protection sur la publication</b>, par decision du
 * proprietaire pour cette premiere etape : n'importe qui atteignant l'API peut
 * publier. A regler avant toute mise en production du blog.
 */
@RestController
@RequestMapping("/api/u2")
@RequiredArgsConstructor
public class ArticleController {

    /**
     * Une image ne change pas tant que l'article ne se modifie pas, ce que
     * l'API ne permet pas encore. Un jour de cache evite de la retelecharger a
     * chaque page, sans figer une erreur pour un an le jour ou la modification
     * arrivera.
     */
    private static final CacheControl IMAGE_CACHE = CacheControl.maxAge(Duration.ofDays(1)).cachePublic();

    private final ArticleService articleService;

    /**
     * @param q recherche facultative dans le titre et le chapeau, sans tenir
     *          compte des majuscules ni des accents. Vide ou absente : tous les
     *          articles.
     */
    @GetMapping("/articles")
    public ArticlePage list(@RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "12") int size,
                            @RequestParam(required = false) String q) {
        return articleService.list(page, size, q);
    }

    @GetMapping("/articles/{slug}")
    public ArticleDetail get(@PathVariable String slug) {
        return articleService.find(slug);
    }

    @GetMapping("/articles/{slug}/image")
    public ResponseEntity<byte[]> image(@PathVariable String slug) {
        ArticleImageView image = articleService.image(slug);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.mediaType()))
                .cacheControl(IMAGE_CACHE)
                .body(image.content());
    }

    /**
     * Publication d'un article, en multipart : une partie {@code article} en
     * JSON, une partie {@code image} facultative.
     *
     * <p>201 avec {@code Location} et l'article cree : le formulaire s'en sert
     * pour ouvrir directement la page publiee, a l'adresse choisie par le
     * serveur.
     */
    @PostMapping(path = "/articles", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArticleDetail> publish(
            @Valid @RequestPart("article") ArticleDraft draft,
            @RequestPart(name = "image", required = false) MultipartFile image) throws IOException {

        // Un champ fichier laisse vide arrive comme une partie de zero octet :
        // c'est un article sans image, pas une image invalide.
        byte[] content = image == null || image.isEmpty() ? null : image.getBytes();

        ArticleDetail created = articleService.publish(draft, content);
        return ResponseEntity.created(URI.create("/api/u2/articles/" + created.slug())).body(created);
    }

    /** Rubriques disponibles, dans l'ordre d'affichage. */
    @GetMapping("/article-categories")
    public List<CategoryView> categories() {
        return Arrays.stream(ArticleCategory.values())
                .map(CategoryView::of)
                .toList();
    }
}
