import { RenderMode } from '@angular/ssr';
import type { ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'ce-site', renderMode: RenderMode.Prerender },
  { path: 'qui-sommes-nous', renderMode: RenderMode.Prerender },
  { path: 'offres-et-tarifs', renderMode: RenderMode.Prerender },
  { path: 'creation-site-vitrine', renderMode: RenderMode.Prerender },
  { path: 'referencement-seo', renderMode: RenderMode.Prerender },
  { path: 'visibilite-ia-geo', renderMode: RenderMode.Prerender },
  { path: 'hebergement-et-maintenance', renderMode: RenderMode.Prerender },
  { path: 'faq', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'legal', renderMode: RenderMode.Prerender },
  // La route 404 est rendue côté client : le serveur statique sert index.html
  // (fallback SPA) et Angular prend le relais pour afficher NotFoundComponent.
  { path: '**', renderMode: RenderMode.Client },
];
