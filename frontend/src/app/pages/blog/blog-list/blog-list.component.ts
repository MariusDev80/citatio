import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { FlourishComponent } from '../../../shared/components/flourish/flourish.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { ArticlePage, BlogService } from '../../../services/blog.service';
import { formatPublishedDate } from '../blog-format';

/** Ce que la liste affiche : une page de l'API, ou l'échec de son chargement. */
interface ListResult {
  page: ArticlePage | null;
  failed: boolean;
}

/**
 * Liste des articles, du plus récent au plus ancien, avec une recherche.
 *
 * Rendue côté client, contrairement aux onze pages du site : la liste vient de
 * u2-blog, que le build ne peut pas joindre, et la production n'a pas de
 * serveur Node pour un rendu à la demande. Le choix et sa conséquence (le
 * contenu n'est pas dans le HTML source) sont détaillés dans
 * `app.routes.server.ts`.
 *
 * L'URL porte tout l'état (`?q=seo&page=2`) : une recherche se partage par
 * son lien, et le bouton Retour du navigateur la retrouve. La page est
 * numérotée à partir de 1 pour le lecteur ; l'API compte à partir de zéro.
 */
@Component({
  selector: 'app-blog-list',
  imports: [RouterLink, ReactiveFormsModule, FlourishComponent, RevealDirective],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent {
  private readonly blog = inject(BlogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Délai de frappe avant de lancer la recherche : une requête par pause, pas par lettre. */
  private static readonly SEARCH_DEBOUNCE_MS = 300;

  protected readonly searchControl = new FormControl('', { nonNullable: true });

  /** Recherche en vigueur, telle que lue dans l'URL. */
  protected readonly query = signal('');

  /**
   * Vrai pendant un chargement. La liste précédente reste affichée, atténuée,
   * plutôt que de disparaître à chaque lettre tapée.
   */
  protected readonly loading = signal(true);
  private readonly result = signal<ListResult | null>(null);

  protected readonly failed = computed(() => this.result()?.failed ?? false);
  /** Faux seulement avant la toute première réponse. */
  protected readonly hasLoaded = computed(() => this.result() !== null);
  protected readonly totalItems = computed(() => this.result()?.page?.totalItems ?? 0);

  /** Articles prêts à afficher : date formatée, rubriques jointes. */
  protected readonly articles = computed(() =>
    (this.result()?.page?.items ?? []).map((article) => ({
      ...article,
      publishedLabel: formatPublishedDate(article.publishedAt),
      categoryLine: article.categories.map((category) => category.label).join(' · '),
      // Couverture typographique des articles sans image : leur première
      // rubrique, plutôt qu'une image générique qui ne dirait rien de vrai.
      coverLabel: article.categories[0]?.label ?? 'Blog',
    })),
  );

  /** Numéro de page affiché au lecteur, à partir de 1. */
  protected readonly pageNumber = computed(() => (this.result()?.page?.page ?? 0) + 1);
  protected readonly totalPages = computed(() => this.result()?.page?.totalPages ?? 0);
  protected readonly hasNewer = computed(() => this.pageNumber() > 1);
  protected readonly hasOlder = computed(() => this.pageNumber() < this.totalPages());

  constructor() {
    this.route.queryParamMap
      .pipe(
        map((params) => ({ page: toApiPage(params.get('page')), q: params.get('q') ?? '' })),
        distinctUntilChanged((a, b) => a.page === b.page && a.q === b.q),
        tap(({ q }) => {
          this.query.set(q);
          // Retour arrière ou lien partagé : le champ reprend la recherche de
          // l'URL. Sans événement, sinon il relancerait la navigation.
          if (this.searchControl.value.trim() !== q) {
            this.searchControl.setValue(q, { emitEvent: false });
          }
          this.loading.set(true);
        }),
        // switchMap : une frappe rapide annule la requête précédente, dont la
        // réponse tardive écraserait sinon la bonne.
        switchMap(({ page, q }) =>
          this.blog.list(page, q).pipe(
            map((result): ListResult => ({ page: result, failed: false })),
            catchError(() => of<ListResult>({ page: null, failed: true })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        this.result.set(result);
        this.loading.set(false);
      });

    // Pas de distinctUntilChanged ici : le champ est aussi réécrit depuis
    // l'URL, sans passer par ce flux, qui garderait alors une valeur périmée et
    // bloquerait une recherche retapée après un retour arrière. applySearch
    // compare à l'URL, c'est la seule référence fiable.
    this.searchControl.valueChanges
      .pipe(
        debounceTime(BlogListComponent.SEARCH_DEBOUNCE_MS),
        map((value) => value.trim()),
        takeUntilDestroyed(),
      )
      .subscribe((q) => this.applySearch(q));
  }

  /** Entrée dans le champ : la recherche part tout de suite, sans attendre le délai. */
  protected submitSearch(event: Event): void {
    event.preventDefault();
    this.applySearch(this.searchControl.value.trim());
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
    this.applySearch('');
  }

  /** Paramètres de lien vers une page voisine ; la page 1 n'a pas de paramètre. */
  protected pageParams(pageNumber: number): { page: number | null } {
    return { page: pageNumber > 1 ? pageNumber : null };
  }

  /**
   * Écrit la recherche dans l'URL, qui déclenche le chargement.
   *
   * `replaceUrl` : sans lui, chaque pause de frappe ajouterait une entrée à
   * l'historique, et le bouton Retour rejouerait la saisie lettre par lettre.
   * Une nouvelle recherche repart de la première page.
   */
  private applySearch(q: string): void {
    if (q === this.query()) {
      return;
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: q || null, page: null },
      replaceUrl: true,
    });
  }
}

/** `?page=3` devient 2 ; toute valeur absente ou fantaisiste ramène au début. */
function toApiPage(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 1 ? parsed - 1 : 0;
}
