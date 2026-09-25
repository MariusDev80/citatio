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
  // Blog : rendu côté client, par choix contraint et provisoire.
  //  - Prerender est impossible : les articles vivent dans u2-blog, que le
  //    build (en CI, sans base) ne peut pas interroger.
  //  - Server demanderait un serveur Node en production, où nginx ne sert que
  //    des fichiers statiques : c'est un changement d'infrastructure à part.
  // Conséquence assumée : le contenu des articles n'est pas dans le HTML
  // source, ce qui contredit l'argument affiché sur /ce-site pour le reste du
  // site. Le blog reste donc en noindex (BLOG_ROBOTS) jusqu'à ce que ce choix
  // soit revu. nginx sert ces adresses en 200 avec index.csr.html.
  { path: 'blog', renderMode: RenderMode.Client },
  { path: 'blog/nouvel-article', renderMode: RenderMode.Client },
  { path: 'blog/:slug', renderMode: RenderMode.Client },
  // La route 404 est rendue côté client : le serveur statique sert index.html
  // (fallback SPA) et Angular prend le relais pour afficher NotFoundComponent.
  { path: '**', renderMode: RenderMode.Client },
];
