import { Routes } from '@angular/router';
import { SeoData } from './services/seo.service';

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
          'Trois formules à partir de 1 200 € HT, plus un abonnement de 39 €/mois couvrant hébergement, nom de domaine et maintenance. Devis ferme sous cinq jours.',
      } satisfies SeoData,
    },
    loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent),
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
