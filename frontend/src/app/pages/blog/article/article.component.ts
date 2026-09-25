import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { COMPANY } from '../../../config/company.config';
import { ArticleDetail, BlogService } from '../../../services/blog.service';
import { JsonLdService } from '../../../services/json-ld.service';
import { SeoService } from '../../../services/seo.service';
import { BLOG_ROBOTS, formatPublishedDate, parseArticleBody } from '../blog-format';

/**
 * `notFound` à part de `error` : une adresse inconnue n'est pas une panne, et
 * le lecteur doit savoir s'il vaut la peine de recharger.
 */
type LoadState = 'loading' | 'ready' | 'notFound' | 'error';

/**
 * Page d'un article, `/blog/:slug`.
 *
 * Rendue côté client (voir `app.routes.server.ts`). Conséquence à connaître :
 * une adresse inconnue affiche « cet article n'existe pas » sous un statut
 * HTTP 200, nginx ne pouvant pas savoir quels articles existent. La page reste
 * en noindex tant que c'est le cas.
 */
@Component({
  selector: 'app-article',
  imports: [RouterLink],
  templateUrl: './article.html',
  styleUrl: './article.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleComponent {
  private readonly blog = inject(BlogService);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly jsonLd = inject(JsonLdService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly article = signal<ArticleDetail | null>(null);

  protected readonly blocks = computed(() => parseArticleBody(this.article()?.body ?? ''));
  protected readonly publishedLabel = computed(() => {
    const article = this.article();
    return article ? formatPublishedDate(article.publishedAt) : '';
  });

  constructor() {
    // Suivi du paramètre plutôt que lecture unique : Angular réutilise le
    // composant d'un article à l'autre, un lien entre articles ne recréerait
    // pas la page.
    this.route.paramMap
      .pipe(
        map((params) => params.get('slug') ?? ''),
        tap(() => this.state.set('loading')),
        switchMap((slug) =>
          this.blog.get(slug).pipe(
            map((article) => ({ article, state: 'ready' as LoadState })),
            catchError((error: HttpErrorResponse) =>
              of({ article: null, state: (error.status === 404 ? 'notFound' : 'error') as LoadState }),
            ),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ article, state }) => {
        this.article.set(article);
        this.state.set(state);
        if (article) {
          this.describe(article);
        }
      });

    inject(DestroyRef).onDestroy(() => {
      this.jsonLd.removeSchema('blog-posting');
      this.jsonLd.removeSchema('breadcrumb-article');
    });
  }

  /** Titre, description et données structurées de l'article chargé. */
  private describe(article: ArticleDetail): void {
    const url = `${COMPANY.url}/blog/${article.slug}`;
    const imageUrl = article.imageUrl ? `${COMPANY.url}${article.imageUrl}` : undefined;

    this.seo.updatePage({
      title: `${article.title} | Citatio`,
      description: article.excerpt,
      ogImage: imageUrl,
      robots: BLOG_ROBOTS,
    });

    // Posées dès maintenant pour que la page soit complète le jour où le blog
    // sera rendu côté serveur et indexé ; sans effet tant qu'il est en noindex.
    this.jsonLd.setSchema('blog-posting', {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.excerpt,
      datePublished: article.publishedAt,
      mainEntityOfPage: url,
      ...(imageUrl && { image: imageUrl }),
      author: { '@type': 'Person', name: article.author },
      publisher: { '@type': 'Organization', name: COMPANY.name, logo: COMPANY.logo },
      articleSection: article.categories.map((category) => category.label),
      inLanguage: 'fr-FR',
    });

    this.jsonLd.setSchema('breadcrumb-article', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: COMPANY.url + '/blog' },
        { '@type': 'ListItem', position: 3, name: article.title, item: url },
      ],
    });
  }
}
