import { Routes } from '@angular/router';
import { SeoData } from './services/seo.service';
import { BLOG_ROBOTS } from './pages/blog/blog-format';

export const routes: Routes = [
  {
    path: '',
    data: {
      seo: {
        title: 'Citatio, agence web près de Nantes, sites vitrines sur mesure',
        description:
          'Agence web à La Chapelle-sur-Erdre : nous concevons, développons et hébergeons des sites vitrines faits à la main pour les artisans, commerces et indépendants de Loire-Atlantique. SEO et visibilité IA en option.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'ce-site',
    data: {
      seo: {
        title: 'Ce site, la démonstration de notre travail | Citatio',
        description:
          'Nous démarrons et n\'avons pas encore de client à montrer. Alors nous montrons ce site : scores Lighthouse mesurés, rendu serveur, accessibilité AA, hébergement. Tout est vérifiable.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/proof/proof.component').then(m => m.ProofComponent),
  },
  {
    path: 'qui-sommes-nous',
    data: {
      seo: {
        title: 'Qui sommes-nous : Marius, Ruben et Titouan | Citatio',
        description:
          'Citatio est une agence web de trois personnes, installée à La Chapelle-sur-Erdre près de Nantes. Nos parcours, notre manière de travailler et ce que nous refusons de faire.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
  },
  {
    path: 'offres-et-tarifs',
    data: {
      seo: {
        title: 'Offres et tarifs des sites vitrines | Citatio',
        description:
          'Trois formules à partir de 1 000 € HT, plus un abonnement à partir de 29 €/mois couvrant hébergement, nom de domaine et maintenance. Devis ferme sous cinq jours.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent),
  },
  {
    path: 'creation-site-vitrine',
    data: {
      seo: {
        title: 'Création de site vitrine sur mesure près de Nantes | Citatio',
        description:
          'Nous concevons et développons votre site vitrine à la main, sans gabarit ni constructeur de pages : 3 à 5 pages, rendu serveur, accessibilité AA, hébergement inclus. À partir de 1 000 € HT, devis ferme sous cinq jours.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/showcase/showcase.component').then(m => m.ShowcaseComponent),
  },
  {
    path: 'referencement-seo',
    data: {
      seo: {
        title: 'Référencement naturel SEO pour site vitrine | Citatio',
        description:
          'Recherche de mots-clés sur votre marché, optimisation on-page, données structurées et recommandations de contenu. Ce que le SEO change, en combien de temps, et ce que nous ne promettons pas. À partir de 1 750 € HT.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/seo-offer/seo-offer.component').then(m => m.SeoOfferComponent),
  },
  {
    path: 'visibilite-ia-geo',
    data: {
      seo: {
        title: 'GEO : être cité par ChatGPT, Gemini et les AI Overviews | Citatio',
        description:
          'Le GEO travaille la présence de votre entreprise dans les réponses des IA : données structurées, llms.txt, accès des crawlers, contenu citable, identité cohérente. Tout est en place sur ce site, vérifiable. À partir de 2 500 € HT.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/geo-offer/geo-offer.component').then(m => m.GeoOfferComponent),
  },
  {
    path: 'hebergement-et-maintenance',
    data: {
      seo: {
        title: 'Hébergement et maintenance de votre site | Citatio',
        description:
          'Ce que veut dire héberger un site, et ce que couvre l\'abonnement mensuel : serveurs en France, nom de domaine à votre nom, HTTPS, sauvegardes hors du serveur, surveillance. Deux formules, 29 ou 59 € HT par mois, sans engagement.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/hosting/hosting.component').then(m => m.HostingComponent),
  },
  {
    path: 'faq',
    data: {
      seo: {
        title: 'Questions fréquentes sur la création de site vitrine | Citatio',
        description:
          'Combien coûte un site vitrine, en combien de temps, qu\'est-ce que le SEO et le GEO, qui héberge le site : nos réponses, sans jargon. Agence web en Loire-Atlantique.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent),
  },
  {
    path: 'contact',
    data: {
      seo: {
        title: 'Contact : parlons de votre projet | Citatio',
        description:
          'Premier échange de trente minutes, gratuit et sans engagement. Réponse sous deux jours ouvrés. Agence web en Loire-Atlantique.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
  },
  {
    path: 'legal',
    data: {
      seo: {
        title: 'Mentions légales et confidentialité | Citatio',
        description:
          'Éditeur, hébergeur, propriété intellectuelle, politique de confidentialité et conditions générales d\'utilisation du site Citatio.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/legal/legal.component').then(m => m.LegalComponent),
  },
  // Blog : rendu côté client et hors index pour l'instant (voir BLOG_ROBOTS
  // et app.routes.server.ts). Absent de la navigation, du sitemap et de
  // llms.txt tant qu'il n'est pas ouvert au public.
  {
    path: 'blog',
    data: {
      seo: {
        title: 'Blog, notes d\'atelier | Citatio',
        description:
          'Ce que nous apprenons en construisant des sites vitrines : ce qu\'ils coûtent, comment ils se trouvent sur Google, comment ils restent en ligne.',
        robots: BLOG_ROBOTS,
      } satisfies SeoData,
    },
    loadComponent: () =>
      import('./pages/blog/blog-list/blog-list.component').then(m => m.BlogListComponent),
  },
  {
    // Déclarée avant `blog/:slug`, qu'elle masquerait sinon. Le serveur ne
    // donne jamais cette adresse à un article (ArticleSlugs.RESERVED).
    path: 'blog/nouvel-article',
    data: {
      seo: {
        title: 'Rédiger un article | Citatio',
        description: 'Formulaire de publication du blog Citatio.',
        robots: BLOG_ROBOTS,
      } satisfies SeoData,
    },
    loadComponent: () =>
      import('./pages/blog/article-form/article-form.component').then(m => m.ArticleFormComponent),
  },
  {
    path: 'blog/:slug',
    data: {
      // Provisoire : la page les remplace une fois l'article chargé.
      seo: {
        title: 'Article | Citatio',
        description: 'Un article du blog Citatio.',
        robots: BLOG_ROBOTS,
      } satisfies SeoData,
    },
    loadComponent: () =>
      import('./pages/blog/article/article.component').then(m => m.ArticleComponent),
  },
  {
    path: '**',
    data: {
      seo: {
        title: 'Page introuvable | Citatio',
        description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
