import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs';
import { COMPANY } from '../config/company.config';

export interface SeoData {
  title: string;
  description: string;
  ogImage?: string;
}

/**
 * Service SSR-compatible qui met à jour les meta tags à chaque navigation.
 *
 * Utilise les `data.seo` des routes pour personnaliser chaque page.
 * Si une route ne définit pas de `seo`, les valeurs par défaut de COMPANY sont utilisées.
 *
 * Fonctionne avec le prerendering : les meta apparaissent dans le HTML statique.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  init(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.getDeepestRoute(this.activatedRoute)),
        map(route => ({
          seo: route.snapshot.data['seo'] as SeoData | undefined,
          path: route.snapshot.url.map(s => s.path).join('/'),
        })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ seo, path }) => this.updateMeta(seo, path));
  }

  private updateMeta(seo: SeoData | undefined, path: string): void {
    const pageTitle = seo?.title ?? COMPANY.name;
    const description = seo?.description ?? COMPANY.description;
    const ogImage = seo?.ogImage ?? COMPANY.ogImage;
    const canonicalUrl = `${COMPANY.url}/${path}`;

    this.title.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });

    this.updateCanonical(canonicalUrl);
  }

  private updateCanonical(url: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (link) {
      link.setAttribute('href', url);
    } else {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      this.document.head.appendChild(link);
    }
  }

  private getDeepestRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
