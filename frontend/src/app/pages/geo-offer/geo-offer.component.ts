import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';
import { FORMULAS } from '../../config/pricing.config';
import { formatEuro } from '../../shared/format-euro';
import { FlourishComponent } from '../../shared/components/flourish/flourish.component';

interface Item {
  readonly title: string;
  readonly body: string;
}

interface Contrast {
  readonly aspect: string;
  readonly seo: string;
  readonly geo: string;
}

/**
 * Spoke page for « GEO / visibilité dans les IA ».
 *
 * This is the page with the best odds of being cited by a model: few French
 * agencies write seriously about GEO, so the topic is far less contested than
 * « agence web Nantes ». The prose is therefore written to be quotable in
 * isolation, one self-contained answer per heading.
 */
@Component({
  selector: 'app-geo-offer',
  templateUrl: './geo-offer.html',
  styleUrl: './geo-offer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FlourishComponent],
})
export class GeoOfferComponent {
  private readonly jsonLd = inject(JsonLdService);

  /** « Vitrine + GEO/SEO », the formula this page details. */
  protected readonly formula = FORMULAS[2];
  protected readonly formatEuro = formatEuro;

  protected readonly contrasts = signal<readonly Contrast[]>([
    {
      aspect: 'Ce qu’on vise',
      seo: 'Une position dans une liste de liens',
      geo: 'Être la source d’une réponse déjà rédigée',
    },
    {
      aspect: 'Ce que voit la personne',
      seo: 'Dix résultats, elle choisit',
      geo: 'Un paragraphe, et deux ou trois sources citées',
    },
    {
      aspect: 'Ce qui compte le plus',
      seo: 'Les mots-clés, les liens, l’ancienneté',
      geo: 'La clarté des faits et ce que d’autres disent de vous',
    },
    {
      aspect: 'Comment on le vérifie',
      seo: 'Des positions mesurables dans la Search Console',
      geo: 'En posant la question au modèle, sans garantie de stabilité',
    },
  ]);

  protected readonly work = signal<readonly Item[]>([
    {
      title: 'Des faits que la machine n’a pas à deviner',
      body:
        'Votre activité, votre adresse, vos horaires, votre zone d’intervention et '
        + 'vos tarifs, écrits dans un <strong>format normalisé</strong> que les moteurs et les '
        + 'modèles lisent directement, au lieu de les extraire à peu près d’un '
        + 'paragraphe.',
    },
    {
      title: 'Un fichier llms.txt',
      body:
        'Un résumé de votre entreprise placé à la racine du site, écrit pour être lu '
        + 'par un modèle : ce que vous faites, ce que vous ne faites pas, vos prix, '
        + 'et les précautions à prendre en vous citant. <strong>Ce site en a un</strong>, vous pouvez '
        + 'aller le lire.',
    },
    {
      title: 'Un accès explicite pour les robots des IA',
      body:
        '<strong>GPTBot, Google-Extended, PerplexityBot</strong> et les autres sont nommés un par un '
        + 'dans le fichier robots.txt. Beaucoup de sites les bloquent sans le savoir, '
        + 'par un réglage par défaut de leur hébergeur.',
    },
    {
      title: 'Un contenu qui se cite tel quel',
      body:
        'Un modèle extrait des passages, pas des pages. Chaque section répond à une '
        + 'question dans un paragraphe qui se tient seul, sans dépendre de la phrase '
        + 'précédente. C’est aussi ce qui rend une page agréable à lire pour un '
        + 'humain pressé.',
    },
    {
      title: 'Une identité cohérente partout',
      body:
        '<strong>Même nom, même adresse, même téléphone</strong> sur le site, sur votre fiche Google '
        + 'et sur vos profils, tous reliés entre eux. C’est ce qui permet à un modèle '
        + 'de comprendre que ces mentions désignent une seule entreprise, et pas '
        + 'trois qui se ressemblent.',
    },
  ]);

  constructor() {
    this.jsonLd.setSchema('service-geo', {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Visibilité dans les IA (GEO)',
      serviceType: 'Generative Engine Optimization',
      description:
        'Optimisation de la présence d’une entreprise dans les réponses de ChatGPT, '
        + 'Gemini, Perplexity et des AI Overviews de Google : données structurées, '
        + 'llms.txt, accès des crawlers IA et contenu citable.',
      provider: {
        '@type': 'Organization',
        name: COMPANY.name,
        url: COMPANY.url,
      },
      areaServed: COMPANY.areaServed.map((name) => ({ '@type': 'Place', name })),
      offers: {
        '@type': 'Offer',
        price: this.formula.from,
        priceCurrency: 'EUR',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: this.formula.from,
          priceCurrency: 'EUR',
          valueAddedTaxIncluded: false,
        },
        url: COMPANY.url + '/visibilite-ia-geo',
      },
    });

    this.jsonLd.setSchema('breadcrumb-geo', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Offres', item: COMPANY.url + '/offres-et-tarifs' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Visibilité dans les IA',
          item: COMPANY.url + '/visibilite-ia-geo',
        },
      ],
    });

    inject(DestroyRef).onDestroy(() => {
      this.jsonLd.removeSchema('service-geo');
      this.jsonLd.removeSchema('breadcrumb-geo');
    });
  }
}
