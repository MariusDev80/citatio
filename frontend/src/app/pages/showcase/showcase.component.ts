import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';
import { FORMULAS } from '../../config/pricing.config';
import { formatEuro } from '../../shared/format-euro';

interface Deliverable {
  readonly title: string;
  readonly body: string;
}

interface Question {
  readonly question: string;
  readonly answer: string;
}

/**
 * Spoke page for « création de site vitrine ».
 *
 * /offres-et-tarifs is the pricing hub and has to serve three intents at once,
 * so it ranks for none of them. This page carries one intent only, and states
 * it in the URL, the title and the h1.
 *
 * Rule for edits: every claim here must already be true elsewhere in the repo
 * (pricing.config.ts, the FAQ, llms.txt) or be verifiable in the product. No
 * client name, no case study, no delivery time we have not actually held.
 */
@Component({
  selector: 'app-showcase',
  templateUrl: './showcase.html',
  styleUrl: './showcase.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class ShowcaseComponent {
  private readonly jsonLd = inject(JsonLdService);

  /** The floor price shown on this page is the one from the Essentiel formula. */
  protected readonly essentiel = FORMULAS[0];
  protected readonly formatEuro = formatEuro;

  protected readonly deliverables = signal<readonly Deliverable[]>([
    {
      title: 'Un design qui n’existe que pour vous',
      body:
        'Pas de thème acheté, pas de gabarit rempli. Nous partons de votre métier, '
        + 'de vos clients et de ce que vous avez à montrer. La maquette est validée '
        + 'avant la première ligne de code.',
    },
    {
      title: 'Trois à cinq pages',
      body:
        'De quoi présenter votre activité, vos prestations, votre équipe et vos '
        + 'coordonnées. Au-delà, chaque page supplémentaire est conçue et intégrée '
        + 'à l’unité.',
    },
    {
      title: 'Des pages qui s’affichent avant le JavaScript',
      body:
        'Le site est rendu côté serveur : le texte est déjà là quand la page arrive. '
        + 'C’est ce qui le rend rapide sur un mobile en 4G, et lisible par les '
        + 'moteurs de recherche sans qu’ils aient à exécuter quoi que ce soit.',
    },
    {
      title: 'Accessible, au sens strict',
      body:
        'Contraste, navigation au clavier, lecteurs d’écran : le site vise le niveau '
        + 'AA du WCAG. Ce n’est pas une case à cocher, c’est ce qui permet à tout le '
        + 'monde de vous lire et de vous joindre.',
    },
    {
      title: 'Une base de référencement technique',
      body:
        'Balises, plan du site, adresses canoniques, données structurées, '
        + 'performances. Ce socle est dans toutes nos formules, y compris sans '
        + 'option SEO : un site invisible aux robots ne se rattrape pas après coup.',
    },
    {
      title: 'Un formulaire de contact qui arrive vraiment',
      body:
        'Les messages tombent dans votre boîte mail. Pas de service tiers intercalé, '
        + 'pas de traceur, pas de revente de ce que vos visiteurs écrivent.',
    },
    {
      title: 'Le domaine et le code sont à vous',
      body:
        'Le nom de domaine est déposé à votre nom. Si vous décidez de partir, nous '
        + 'vous remettons le site entier et le domaine, sans discussion.',
    },
  ]);

  protected readonly questions = signal<readonly Question[]>([
    {
      question: 'Un outil en ligne ne suffirait pas ?',
      answer:
        'Pour beaucoup de projets, si. Monter un site avec un constructeur de pages '
        + 'prend un après-midi, et si votre besoin est de simplement exister quelque '
        + 'part, c’est la bonne réponse et nous vous le dirons. La différence se '
        + 'joue sur la durée : un site fait à la main reste rapide, se corrige '
        + 'précisément, et ne dépend pas d’un abonnement dont le prix et les '
        + 'fonctions changent sans vous demander votre avis.',
    },
    {
      question: 'J’ai déjà une page Facebook ou Instagram.',
      answer:
        'Elle travaille pour la plateforme avant de travailler pour vous : vous ne '
        + 'décidez ni de qui voit vos publications, ni de ce qui reste en ligne dans '
        + 'trois ans. Un site est l’adresse que vous possédez, celle qui apparaît '
        + 'dans une recherche et que vous mettez sur un devis ou un camion.',
    },
    {
      question: 'Je n’ai ni texte ni photo.',
      answer:
        'C’est le cas le plus courant. Nous vous accompagnons sur ce qu’il faut dire '
        + 'et dans quel ordre, et le pack contenu couvre la rédaction si vous '
        + 'préférez nous la confier. Nous ne démarrons pas un projet en attendant '
        + 'que vous nous envoyiez un jour les textes.',
    },
    {
      question: 'Et si je veux modifier le site moi-même ?',
      answer:
        'Nous ne livrons pas d’interface d’édition. C’est un choix : c’est ce qui '
        + 'garantit que le site reste rapide et accessible, et cela vous évite '
        + 'd’entretenir un outil de plus. Les modifications passent par nous. '
        + 'Dites-nous à quelle fréquence vous comptez faire évoluer vos pages, nous '
        + 'en tenons compte dès le devis.',
    },
  ]);

  constructor() {
    this.jsonLd.setSchema('service-showcase', {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Création de site vitrine sur mesure',
      serviceType: 'Création de site vitrine',
      description:
        'Conception et développement d’un site vitrine sur mesure, écrit à la main, '
        + 'avec rendu serveur, accessibilité AA et base SEO technique.',
      provider: {
        '@type': 'Organization',
        name: COMPANY.name,
        url: COMPANY.url,
      },
      areaServed: COMPANY.areaServed.map((name) => ({ '@type': 'Place', name })),
      offers: {
        '@type': 'Offer',
        price: this.essentiel.from,
        priceCurrency: 'EUR',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: this.essentiel.from,
          priceCurrency: 'EUR',
          valueAddedTaxIncluded: false,
        },
        url: COMPANY.url + '/creation-site-vitrine',
      },
    });

    this.jsonLd.setSchema('breadcrumb-showcase', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Offres', item: COMPANY.url + '/offres-et-tarifs' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Création de site vitrine',
          item: COMPANY.url + '/creation-site-vitrine',
        },
      ],
    });

    inject(DestroyRef).onDestroy(() => {
      this.jsonLd.removeSchema('service-showcase');
      this.jsonLd.removeSchema('breadcrumb-showcase');
    });
  }
}
