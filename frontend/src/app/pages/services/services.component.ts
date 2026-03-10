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

  constructor() {
    const provider = { '@type': 'Organization', name: COMPANY.name };

    this.jsonLd.setSchema('services', {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Services ${COMPANY.name}`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Service',
            name: 'Audit de visibilité IA',
            description:
              'Mesure de votre présence actuelle sur les moteurs génératifs (ChatGPT, Gemini, Perplexity) avec un rapport détaillé.',
            provider,
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Service',
            name: 'Stratégie GEO sur mesure',
            description:
              'Plan d\'action adapté à votre secteur : optimisation de contenus pour les LLM, construction d\'autorité thématique.',
            provider,
          },
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@type': 'Service',
            name: 'Production de contenus optimisés IA',
            description:
              'Création et restructuration de contenus pour qu\'ils soient compris, synthétisés et cités par les moteurs génératifs.',
            provider,
          },
        },
        {
          '@type': 'ListItem',
          position: 4,
          item: {
            '@type': 'Service',
            name: 'Complémentarité SEO + GEO',
            description:
              'Collaboration avec votre agence SEO existante pour ajouter la couche IA à votre référencement.',
            provider,
          },
        },
        {
          '@type': 'ListItem',
          position: 5,
          item: {
            '@type': 'Service',
            name: 'Relations publiques numériques',
            description:
              'Amplification de votre présence sur les médias et plateformes que les LLM consultent pour construire leurs réponses.',
            provider,
          },
        },
        {
          '@type': 'ListItem',
          position: 6,
          item: {
            '@type': 'Service',
            name: 'Suivi & Reporting',
            description:
              'Mesure régulière de la progression : fréquence de citation, positionnement dans les réponses IA, évolution vs concurrents.',
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
        { '@type': 'ListItem', position: 2, name: 'Services', item: COMPANY.url + '/services' },
      ],
    });

    inject(DestroyRef).onDestroy(() => {
      this.jsonLd.removeSchema('services');
      this.jsonLd.removeSchema('breadcrumb-services');
    });
  }
}
