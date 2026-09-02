import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';
import { FORMULAS, OPTIONS, PRICE_FACTORS, SUBSCRIPTION } from '../../config/pricing.config';
import { formatEuro } from '../../shared/format-euro';
import { FlourishComponent } from '../../shared/components/flourish/flourish.component';

interface FaqLink {
  readonly path: string;
  readonly label: string;
}

interface FaqItem {
  readonly question: string;
  /**
   * Must read as a complete answer on its own: this exact string is what the
   * FAQPage schema exposes, and what an engine or a model lifts out of the
   * page. It therefore carries no link and depends on no neighbouring item.
   */
  readonly answer: string;
  /** Rendered under the answer, deliberately outside the schema text. */
  readonly links?: readonly FaqLink[];
}

interface FaqGroup {
  readonly title: string;
  readonly items: readonly FaqItem[];
}

const [ESSENTIEL, VITRINE_SEO, VITRINE_GEO] = FORMULAS;
const EXTRA_PAGE = OPTIONS.find((o) => o.name === 'Pages supplémentaires');

/** « 1 200 € » with the narrow no-break space French typography expects. */
const euros = (amount: number) => `${formatEuro(amount)} €`;

/**
 * Amounts, price factors and the area served are composed from the config
 * rather than retyped. pricing.config.ts declares itself the single source of
 * truth for every figure in the app, and a FAQ that quotes a stale price is
 * worse than one that stays vague.
 */
@Component({
  selector: 'app-faq',
  imports: [RouterLink, FlourishComponent],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  private readonly jsonLd = inject(JsonLdService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly groups = signal<readonly FaqGroup[]>([
    {
      title: 'Le projet',
      items: [
        {
          question: 'Que fait Citatio exactement ?',
          answer:
            'Citatio est une agence web installée à ' + COMPANY.address.city + ', près de '
            + 'Nantes, qui conçoit et développe des sites vitrines sur mesure pour les '
            + 'artisans, commerces, TPE, PME et indépendants. Trois formules : le site seul, '
            + 'le site avec le référencement Google (SEO), ou le site avec le référencement '
            + 'et la visibilité dans les réponses des IA (GEO). L’hébergement, le nom de '
            + 'domaine et la maintenance sont regroupés dans un abonnement mensuel unique.',
          links: [{ path: '/offres-et-tarifs', label: 'Les trois formules en détail' }],
        },
        {
          question: 'Combien de temps faut-il pour créer mon site ?',
          answer:
            'Après le premier échange, vous recevez un devis ferme sous cinq jours ouvrés. '
            + 'Une fois le devis signé, comptez trois à cinq semaines entre la maquette et '
            + 'la mise en ligne. Ce qui décale un projet n’est presque jamais technique : '
            + 'c’est l’attente des textes et des photos. Si vous nous confiez la rédaction, '
            + 'le planning ne dépend plus de vos disponibilités.',
        },
        {
          question: 'Comment se passe un premier échange avec Citatio ?',
          answer:
            'Trente minutes, gratuit, sans engagement, pour comprendre votre activité et ce '
            + 'que le site doit vous apporter. Vous repartez avec un avis franc : si un site '
            + 'vitrine n’est pas ce qu’il vous faut, ou si votre projet ne relève pas de '
            + 'notre métier, nous vous le disons à ce moment-là plutôt qu’après le devis.',
          links: [{ path: '/contact', label: 'Prendre rendez-vous' }],
        },
        {
          question: 'Je n’ai ni texte, ni photo, ni logo. Pouvez-vous m’aider ?',
          answer:
            'Oui, et c’est le cas le plus courant. Nous vous accompagnons sur ce qu’il faut '
            + 'dire et dans quel ordre. Le pack contenu couvre la rédaction de vos pages si '
            + 'vous préférez nous la confier, et l’option identité visuelle couvre le logo, '
            + 'la palette et les règles typographiques si vous partez de zéro. Nous ne '
            + 'démarrons pas un projet en attendant que vous nous envoyiez un jour les textes.',
        },
        {
          question: 'Pourrai-je modifier le site moi-même ?',
          answer:
            'Non, et c’est un choix. Nous ne livrons pas d’interface d’édition : c’est ce qui '
            + 'garantit que le site reste rapide et accessible dans le temps, et cela vous '
            + 'évite d’entretenir un outil de plus. Les modifications passent par nous. '
            + 'Dites-nous à quelle fréquence vous comptez faire évoluer vos pages, nous en '
            + 'tenons compte dès le devis.',
          links: [{ path: '/creation-site-vitrine', label: 'Ce que contient une création' }],
        },
        {
          question: 'Mon site sera-t-il adapté au mobile ?',
          answer:
            'Toujours. Les pages sont conçues pour le mobile autant que pour l’ordinateur, et '
            + 'elles sont rendues côté serveur : le texte est déjà là quand la page arrive, '
            + 'ce qui les rend rapides même sur un réseau médiocre. Le site vise aussi le '
            + 'niveau AA du WCAG, ce qui couvre le contraste, la navigation au clavier et '
            + 'les lecteurs d’écran.',
          links: [{ path: '/ce-site', label: 'Les mesures de ce site' }],
        },
        {
          question: 'Travaillez-vous en dehors de la région nantaise ?',
          answer:
            'Nous sommes installés à ' + COMPANY.address.city + ' et nous intervenons '
            + 'principalement sur ' + COMPANY.areaServed.slice(0, 3).join(', ') + ' et le '
            + 'reste des Pays de la Loire. Rien n’empêche techniquement de travailler plus '
            + 'loin, mais nous préférons pouvoir vous rencontrer : comprendre une activité '
            + 'se fait mal par écran interposé.',
        },
      ],
    },
    {
      title: 'Les prix',
      items: [
        {
          question: 'Combien coûte un site vitrine ?',
          answer:
            'Nos prix sont publics. ' + ESSENTIEL.name + ' démarre à '
            + euros(ESSENTIEL.from) + ' hors taxes, ' + VITRINE_SEO.name + ' à '
            + euros(VITRINE_SEO.from) + ' et ' + VITRINE_GEO.name + ' à '
            + euros(VITRINE_GEO.from) + '. Ce sont des prix plancher, pas des prix finaux : '
            + 'après le premier échange, vous recevez un devis ferme, et c’est ce '
            + 'montant-là que vous payez, même si le projet nous prend plus de temps que '
            + 'prévu. S’y ajoute l’abonnement mensuel pour l’hébergement, le domaine et la '
            + 'maintenance.',
          links: [{ path: '/offres-et-tarifs', label: 'Le détail des trois formules' }],
        },
        {
          question: 'Que couvre l’abonnement mensuel ?',
          answer:
            SUBSCRIPTION.price + ' € hors taxes par ' + SUBSCRIPTION.period + '. '
            + SUBSCRIPTION.description + ' Il n’y a pas d’engagement de durée, et pas de '
            + 'frais de mise en service cachés derrière.',
        },
        {
          question: 'Qu’est-ce qui fait varier le prix d’un devis ?',
          answer:
            'Cinq choses : ' + PRICE_FACTORS.map((f) => f.charAt(0).toLowerCase() + f.slice(1))
              .join(' ; ') + '. Au-delà des pages comprises dans la formule, chaque page '
            + 'supplémentaire est conçue et intégrée à l’unité, à ' + EXTRA_PAGE?.price + '.',
        },
        {
          question: 'Que se passe-t-il si j’arrête l’abonnement ?',
          answer:
            'Vous partez quand vous voulez, il n’y a pas d’engagement de durée. Nous vous '
            + 'remettons alors votre nom de domaine et l’intégralité du site, pour que vous '
            + 'puissiez l’héberger ailleurs. Nous ne gardons rien en otage : c’est votre '
            + 'site, pas une location.',
        },
        {
          question: 'À qui appartiennent le site et le nom de domaine ?',
          answer:
            'À vous. Le nom de domaine est déposé à votre nom dès le départ, pas au nôtre, '
            + 'et le code du site vous revient. C’est une différence concrète avec les '
            + 'formules d’abonnement où le site disparaît le jour où vous cessez de payer.',
        },
      ],
    },
    {
      title: 'Le référencement et les IA',
      items: [
        {
          question: 'C’est quoi le SEO et le GEO, et en ai-je besoin ?',
          answer:
            'Le SEO, ou référencement naturel, vise à faire apparaître votre site dans les '
            + 'résultats de Google sans payer la place. Le GEO vise à faire citer votre '
            + 'entreprise par les moteurs de réponse fondés sur l’IA, comme ChatGPT, Gemini '
            + 'ou les AI Overviews de Google. Ce sont deux options distinctes, à activer '
            + 'selon votre marché : sur un métier où les gens vous trouvent par le '
            + 'bouche-à-oreille, elles ne sont pas prioritaires. Toute création inclut '
            + 'de toute façon une base SEO technique, sans supplément.',
          links: [
            { path: '/referencement-seo', label: 'Le référencement naturel' },
            { path: '/visibilite-ia-geo', label: 'La visibilité dans les IA' },
          ],
        },
        {
          question: 'En combien de temps le référencement donne-t-il des résultats ?',
          answer:
            'Comptez trois à six mois avant de voir bouger des requêtes locales et peu '
            + 'disputées, et davantage sur des termes que des agences installées depuis '
            + 'vingt ans occupent déjà. Un domaine récent doit d’abord être exploré, indexé, '
            + 'puis gagner une confiance qui ne s’obtient qu’avec le temps. Une entreprise '
            + 'qui vous annonce la première place en six semaines vous vend soit de la '
            + 'publicité sous un autre nom, soit rien.',
          links: [{ path: '/referencement-seo', label: 'Ce que couvre l’option SEO' }],
        },
        {
          question: 'Garantissez-vous la première place sur Google ?',
          answer:
            'Non, et personne ne le peut honnêtement. Une position dépend de vos '
            + 'concurrents, de leur ancienneté et de décisions de Google sur lesquelles '
            + 'aucun prestataire n’a la main. Ce que nous garantissons, c’est le travail : '
            + 'un socle technique correct, des pages qui répondent à de vraies requêtes, et '
            + 'un accès à la Search Console pour que vous voyiez les mêmes chiffres que nous.',
        },
      ],
    },
    {
      title: 'Ce que nous ne faisons pas',
      items: [
        {
          question: 'Faites-vous des boutiques en ligne ?',
          answer:
            'Non. Ni boutique en ligne, ni application métier. Ce ne sont pas de mauvaises '
            + 'choses à faire, ce sont des métiers que nous ne pratiquons pas, et nous '
            + 'préférons vous orienter ailleurs plutôt que d’apprendre sur votre projet. Si '
            + 'votre besoin est de vendre en ligne, dites-le au premier échange.',
        },
        {
          question: 'Pouvez-vous reprendre un site que je possède déjà ?',
          answer:
            'Non, sauf si nous l’avons écrit. Reprendre un site dont nous n’avons pas la '
            + 'main sur le code revient à nous rendre responsables de choix que nous n’avons '
            + 'pas faits et que nous ne pouvons pas garantir. En revanche, refaire le site '
            + 'entièrement fait partie de nos formules, et vos contenus existants sont '
            + 'réutilisables.',
        },
        {
          question: 'Pourquoi n’avez-vous aucune réalisation à montrer ?',
          answer:
            'Parce que nous démarrons, et que nous préférons le dire plutôt que d’habiller '
            + 'la page de logos empruntés ou de témoignages inventés. À la place, nous '
            + 'montrons le seul site dont nous sommes entièrement responsables : celui-ci. '
            + 'Sa vitesse, son accessibilité, son référencement et son hébergement sont '
            + 'exactement ce que nous vendons, et tout y est vérifiable par vous, tout de '
            + 'suite.',
          links: [{ path: '/ce-site', label: 'Ce site, comme démonstration' }],
        },
      ],
    },
  ]);

  constructor() {
    this.jsonLd.setSchema('faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: this.groups().flatMap((group) =>
        group.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      ),
    });

    this.jsonLd.setSchema('breadcrumb-faq', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'FAQ', item: COMPANY.url + '/faq' },
      ],
    });

    this.destroyRef.onDestroy(() => {
      this.jsonLd.removeSchema('faq');
      this.jsonLd.removeSchema('breadcrumb-faq');
    });
  }
}
