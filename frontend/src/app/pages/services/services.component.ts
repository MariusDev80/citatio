import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';

@Component({
  selector: 'app-services',
  templateUrl: './services.html',
  styleUrl: './services.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent {
  private readonly jsonLd = inject(JsonLdService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const provider = { '@type': 'Organization', name: COMPANY.name };

    this.jsonLd.setSchema('services', {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Offres ${COMPANY.name}`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Service',
            name: 'Vitrine Essentiel',
            description:
              'Création d\'un site vitrine responsive (3 à 5 pages) avec design sur mesure, formulaire de contact et base SEO technique.',
            provider,
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Service',
            name: 'Vitrine + SEO',
            description:
              'Site vitrine optimisé pour Google : SEO on-page, recherche de mots-clés, données structurées (schema.org) et recommandations de contenu.',
            provider,
          },
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@type': 'Service',
            name: 'Vitrine + GEO/SEO',
            description:
              'Site vitrine visible sur Google et sur les IA : optimisation GEO (ChatGPT, Gemini, Google AI Overview) et contenu pensé pour la citation par les IA.',
            provider,
          },
        },
        {
          '@type': 'ListItem',
          position: 4,
          item: {
            '@type': 'Service',
            name: 'Hébergement & maintenance',
            description:
              'Hébergement géré, configuration du nom de domaine, mises à jour, sécurité et sauvegardes en abonnement.',
            provider,
          },
        },
        {
          '@type': 'ListItem',
          position: 5,
          item: {
            '@type': 'Service',
            name: 'Pack contenu',
            description:
              'Rédaction de pages et d\'articles de blog, à l\'article ou en forfait.',
            provider,
          },
        },
        {
          '@type': 'ListItem',
          position: 6,
          item: {
            '@type': 'Service',
            name: 'Emailing',
            description:
              'Mise en place de l\'envoi de mails : transactionnel et newsletter.',
            provider,
          },
        },
      ],
    });

    this.jsonLd.setSchema('breadcrumb-services', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Offres', item: COMPANY.url + '/services' },
      ],
    });

    this.destroyRef.onDestroy(() => {
      this.jsonLd.removeSchema('services');
      this.jsonLd.removeSchema('breadcrumb-services');
    });
  }
}
