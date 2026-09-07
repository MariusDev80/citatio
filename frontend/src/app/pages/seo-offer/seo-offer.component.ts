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

/**
 * Spoke page for « référencement naturel / SEO ».
 *
 * Named SeoOfferComponent, not SeoComponent, so it is never confused with
 * SeoService, which handles per-route titles and canonicals.
 *
 * The page deliberately spends as much room on what we do not promise as on
 * what we sell: llms.txt already states that Citatio does not guarantee a first
 * position, and the site loses its footing the moment a page contradicts that.
 */
@Component({
  selector: 'app-seo-offer',
  templateUrl: './seo-offer.html',
  styleUrl: './seo-offer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FlourishComponent],
})
export class SeoOfferComponent {
  private readonly jsonLd = inject(JsonLdService);

  /** « Vitrine + SEO », the formula this page details. */
  protected readonly formula = FORMULAS[1];
  protected readonly formatEuro = formatEuro;

  /** In every formula, option or not: the technical floor. */
  protected readonly included = signal<readonly Item[]>([
    {
      title: 'Un site que les robots lisent sans effort',
      body:
        'Les pages sont <strong>rendues côté serveur</strong> : le texte est dans le HTML, pas '
        + 'derrière du JavaScript à exécuter. C’est la condition d’entrée, et '
        + 'beaucoup de sites la ratent sans le savoir.',
    },
    {
      title: 'Les balises et le plan du site',
      body:
        'Un titre et une description propres à chaque page, une adresse canonique, '
        + 'un sitemap tenu à jour et un robots.txt qui n’interdit rien par accident.',
    },
    {
      title: 'La vitesse',
      body:
        'Google mesure l’expérience réelle de vos visiteurs. <strong>Un site lent est '
        + 'pénalisé deux fois</strong> : au classement, et par les gens qui repartent avant '
        + 'de vous avoir lu.',
    },
    {
      title: 'Les données structurées de base',
      body:
        'Votre entreprise, votre adresse, vos horaires et votre zone d’intervention, '
        + 'décrits dans un format que les moteurs comprennent sans deviner.',
    },
  ]);

  /** What the paid option adds on top, mirrors FORMULAS[1].features. */
  protected readonly option = signal<readonly Item[]>([
    {
      title: 'La recherche de mots-clés sur votre marché',
      body:
        'Nous regardons <strong>ce que vos clients tapent réellement</strong>, pas ce que le métier '
        + 'croit qu’ils tapent, et à quel point chaque requête est disputée. '
        + 'Certaines ne valent pas la peine d’être visées, et c’est une information '
        + 'utile.',
    },
    {
      title: 'Une page, une intention',
      body:
        'Une page qui traite trois sujets n’est la meilleure réponse à aucun. Nous '
        + 'construisons l’arborescence pour qu’à <strong>chaque question de vos clients '
        + 'corresponde une page</strong>, avec le vocabulaire de la question dans son titre '
        + 'et son adresse.',
    },
    {
      title: 'Les données structurées étendues',
      body:
        'Prestations, tarifs, questions fréquentes, fil d’Ariane. C’est ce qui '
        + 'permet à une page d’occuper plus de place dans une page de résultats, '
        + 'avec un prix ou une liste de questions dépliables.',
    },
    {
      title: 'Des recommandations de contenu',
      body:
        'Quelles pages écrire, dans quel ordre, et pourquoi. Vous les rédigez, ou '
        + 'vous nous les confiez avec le pack contenu. <strong>Sans contenu, l’optimisation '
        + 'technique atteint vite son plafond.</strong>',
    },
  ]);

  constructor() {
    this.jsonLd.setSchema('service-seo', {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Référencement naturel (SEO) pour site vitrine',
      serviceType: 'Référencement naturel',
      description:
        'Recherche de mots-clés, optimisation on-page, données structurées et '
        + 'recommandations de contenu, en option sur la création d’un site vitrine.',
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
        url: COMPANY.url + '/referencement-seo',
      },
    });

    this.jsonLd.setSchema('breadcrumb-seo', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Offres', item: COMPANY.url + '/offres-et-tarifs' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Référencement naturel',
          item: COMPANY.url + '/referencement-seo',
        },
      ],
    });

    inject(DestroyRef).onDestroy(() => {
      this.jsonLd.removeSchema('service-seo');
      this.jsonLd.removeSchema('breadcrumb-seo');
    });
  }
}
