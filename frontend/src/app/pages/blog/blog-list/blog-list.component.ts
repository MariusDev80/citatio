import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ArticlePage, BlogService } from '../../../services/blog.service';
import { formatPublishedDate } from '../blog-format';

/** Etat du chargement, trois cas que la page affiche différemment. */
type LoadState = 'loading' | 'ready' | 'error';

/**
 * Liste des articles, du plus récent au plus ancien.
 *
 * Rendue côté client, contrairement aux onze pages du site : la liste vient de
 * u2-blog, que le build ne peut pas joindre, et la production n'a pas de
 * serveur Node pour un rendu à la demande. Le choix et sa conséquence (le
 * contenu n'est pas dans le HTML source) sont détaillés dans
 * `app.routes.server.ts`.
 *
 * La page courante vit dans l'URL (`?page=2`), numérotée à partir de 1 pour le
 * lecteur ; l'API compte à partir de zéro.
 */
@Component({
  selector: 'app-blog-list',
  imports: [RouterLink],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent {
  private readonly blog = inject(BlogService);
  private readonly route = inject(ActivatedRoute);

  protected readonly state = signal<LoadState>('loading');
  private readonly result = signal<ArticlePage | null>(null);

  /** Articles prêts à afficher, date déjà formatée. */
  protected readonly articles = computed(() =>
    (this.result()?.items ?? []).map((article) => ({
      ...article,
      publishedLabel: formatPublishedDate(article.publishedAt),
    })),
  );

  /** Numéro de page affiché au lecteur, à partir de 1. */
  protected readonly pageNumber = computed(() => (this.result()?.page ?? 0) + 1);
  protected readonly totalPages = computed(() => this.result()?.totalPages ?? 0);
  protected readonly hasNewer = computed(() => this.pageNumber() > 1);
  protected readonly hasOlder = computed(() => this.pageNumber() < this.totalPages());

  constructor() {
    this.route.queryParamMap
      .pipe(
        map((params) => toApiPage(params.get('page'))),
        tap(() => this.state.set('loading')),
        // switchMap : un clic rapide sur « plus anciens » annule la page
        // précédente, dont la réponse tardive écraserait sinon la bonne.
        switchMap((page) =>
          this.blog.list(page).pipe(
            map((result) => ({ result, failed: false })),
            catchError(() => of({ result: null, failed: true })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ result, failed }) => {
        this.result.set(result);
        this.state.set(failed ? 'error' : 'ready');
      });
  }

  /** Paramètres de lien vers une page voisine ; la page 1 n'a pas de paramètre. */
  protected pageParams(pageNumber: number): { page: number | null } {
    return { page: pageNumber > 1 ? pageNumber : null };
  }
}

/** `?page=3` devient 2 ; toute valeur absente ou fantaisiste ramène au début. */
function toApiPage(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 1 ? parsed - 1 : 0;
}
