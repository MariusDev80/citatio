import { Routes } from '@angular/router';
import { SeoData } from './services/seo.service';

export const routes: Routes = [
  {
    path: '',
    data: {
      seo: {
        title: 'Citatio — Studio web : sites vitrines sur mesure',
        description:
          'Citatio est un studio web qui crée des sites vitrines sur mesure pour les TPE, PME et indépendants. Référencement Google (SEO) et visibilité sur l\'IA (GEO) en option, hébergement et maintenance inclus.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'about',
    data: {
      seo: {
        title: 'À propos — Citatio, studio web',
        description:
          'Découvrez Citatio, le studio web qui conçoit des sites vitrines sur mesure pour les TPE, PME et indépendants, avec le SEO et la visibilité IA (GEO) en option.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
  },
  {
    path: 'services',
    data: {
      seo: {
        title: 'Nos offres — Citatio',
        description:
          'Création de sites vitrines : formules Vitrine Essentiel, Vitrine + SEO et Vitrine + GEO/SEO. Options hébergement, nom de domaine, maintenance et contenu.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent),
  },
  {
    path: 'faq',
    data: {
      seo: {
        title: 'FAQ — Citatio',
        description:
          'Réponses aux questions fréquentes : création de site vitrine, délais et tarifs, options SEO et GEO, hébergement, nom de domaine et maintenance.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent),
  },
  {
    path: 'contact',
    data: {
      seo: {
        title: 'Contact — Citatio',
        description:
          'Contactez Citatio pour un premier échange gratuit et un devis sur la création de votre site vitrine, avec ou sans options SEO et GEO.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
  },
  {
    path: 'legal',
    data: {
      seo: {
        title: 'Mentions légales — Citatio',
        description:
          'Mentions légales, politique de confidentialité et conditions générales d\'utilisation du site Citatio.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/legal/legal.component').then(m => m.LegalComponent),
  },
  {
    path: '**',
    data: {
      seo: {
        title: 'Page introuvable — Citatio',
        description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
