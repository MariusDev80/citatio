import { Routes } from '@angular/router';
import { SeoData } from './services/seo.service';

export const routes: Routes = [
  {
    path: '',
    title: 'Citatio GEO — Rendez votre entreprise visible sur l\'IA',
    data: {
      seo: {
        title: 'Citatio GEO — Rendez votre entreprise visible sur l\'IA',
        description:
          'Citatio GEO optimise la visibilité de votre entreprise sur les moteurs de recherche IA : ChatGPT, Gemini, Google AI Overview. Soyez cité dans les réponses IA.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'about',
    title: 'À propos — Citatio GEO',
    data: {
      seo: {
        title: 'À propos — Citatio GEO',
        description:
          'Découvrez Citatio GEO, l\'agence spécialisée en Generative Engine Optimization. Notre mission : rendre votre entreprise visible sur les moteurs IA.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
  },
  {
    path: 'services',
    title: 'Nos services — Citatio GEO',
    data: {
      seo: {
        title: 'Nos services — Citatio GEO',
        description:
          'Audit de visibilité IA, stratégie GEO sur mesure, production de contenus optimisés IA, relations publiques numériques et suivi de performance.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent),
  },
  {
    path: 'faq',
    title: 'FAQ — Citatio GEO',
    data: {
      seo: {
        title: 'FAQ — Citatio GEO',
        description:
          'Réponses aux questions fréquentes sur le GEO, la différence avec le SEO, les délais de résultats et la complémentarité avec votre agence SEO.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent),
  },
  {
    path: 'contact',
    title: 'Contact — Citatio GEO',
    data: {
      seo: {
        title: 'Contact — Citatio GEO',
        description:
          'Contactez Citatio GEO pour un premier échange gratuit sur la visibilité de votre entreprise sur les moteurs de recherche IA.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
  },
  {
    path: 'legal',
    title: 'Mentions légales — Citatio GEO',
    data: {
      seo: {
        title: 'Mentions légales — Citatio GEO',
        description:
          'Mentions légales, politique de confidentialité et conditions générales d\'utilisation du site Citatio GEO.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/legal/legal.component').then(m => m.LegalComponent),
  },
  {
    path: '**',
    title: 'Page introuvable — Citatio GEO',
    data: {
      seo: {
        title: 'Page introuvable — Citatio GEO',
        description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
