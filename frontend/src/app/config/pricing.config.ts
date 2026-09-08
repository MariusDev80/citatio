/**
 * ⚠️ TODO(pricing): PROVISIONAL AMOUNTS, NOT CONTRACTUAL.
 *
 * `docs/product/offres.md` §3 still lists every price as « À DÉFINIR ». These
 * figures are placeholders chosen with the owner so the Offers page can be
 * judged with realistic numbers instead of three « Sur devis » rows. Replace
 * them here, this file is the single source of truth, nothing else in the app
 * hardcodes an amount.
 *
 * Owner decision (validated): showing a floor price beats « Sur devis », which
 * blocks any decision and contradicts the « Transparence » value we claim.
 */

export interface Formula {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  /** Floor price in euros, excl. VAT. Displayed as « à partir de ». */
  readonly from: number;
  readonly features: readonly string[];
  /**
   * Route of the page that details this formula. /offres-et-tarifs is the hub
   * and cannot rank for three intents at once; each spoke carries one.
   */
  readonly detailPath: string;
  /** Link wording, phrased for the destination rather than « en savoir plus ». */
  readonly detailLabel: string;
}

export interface Option {
  readonly name: string;
  readonly description: string;
  /** Human-readable price, e.g. « 39 €/mois » or « sur devis ». */
  readonly price: string;
}

export const FORMULAS: readonly Formula[] = [
  {
    id: 'essentiel',
    detailPath: '/creation-site-vitrine',
    detailLabel: 'Comment nous créons un site vitrine',
    name: 'Vitrine Essentiel',
    tagline: 'Une présence web simple et crédible.',
    from: 1000,
    features: [
      'Site vitrine responsive, 3 à 5 pages',
      'Design sur mesure à partir de notre design system',
      'Formulaire de contact',
      'Base SEO technique : balises, sitemap, performances',
      'Rendu serveur et accessibilité AA',
    ],
  },
  {
    id: 'seo',
    detailPath: '/referencement-seo',
    detailLabel: 'Ce que le référencement change',
    name: 'Vitrine + SEO',
    tagline: 'Pour être trouvé sur Google.',
    from: 1750,
    features: [
      'Tout le pack Vitrine Essentiel',
      'Optimisation SEO on-page',
      'Recherche de mots-clés sur votre marché',
      'Données structurées schema.org',
      'Recommandations de contenu',
    ],
  },
  {
    id: 'geo',
    detailPath: '/visibilite-ia-geo',
    detailLabel: 'Comment on travaille la visibilité IA',
    name: 'Vitrine + GEO/SEO',
    tagline: 'Pour être trouvé sur Google et dans les IA.',
    from: 2500,
    features: [
      'Tout le pack Vitrine + SEO',
      'Optimisation GEO : ChatGPT, Gemini, AI Overviews',
      'Contenu structuré pour la citation par les IA',
      'Accès contrôlé aux crawlers IA',
    ],
  },
] as const;

export interface Subscription {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  /** Monthly price in euros, excl. VAT. */
  readonly price: number;
  readonly period: string;
  readonly features: readonly string[];
}

/**
 * Les deux abonnements mensuels, dont le client choisit l'un ou l'autre.
 *
 * Il y en avait un seul, à 39 €, qui mélangeait l'infrastructure et le travail
 * humain. Les séparer permet de dire ce que chacun paye : le palier bas ne
 * couvre que ce qui tourne tout seul, le palier haut y ajoute du temps passé.
 *
 * Le nom de domaine reste dans les deux, alors que le guide d'infrastructure en
 * fait une ligne de facturation distincte : il coûte une quinzaine d'euros par
 * an, et l'en sortir obligerait à démentir la promesse « le domaine est à vous,
 * déposé à votre nom » que portent l'accueil, la FAQ et /creation-site-vitrine.
 */
export const SUBSCRIPTIONS: readonly Subscription[] = [
  {
    id: 'hebergement',
    name: 'Hébergement',
    tagline: 'Le strict nécessaire pour que le site soit en ligne, et le reste.',
    price: 29,
    period: 'mois',
    features: [
      'Votre site sur nos serveurs, en France',
      'Nom de domaine déposé à votre nom, et renouvelé chaque année',
      'Certificat HTTPS, renouvelé automatiquement',
      'Sauvegardes quotidiennes, conservées ailleurs que sur le serveur',
      'Surveillance de la disponibilité et mises à jour de sécurité',
    ],
  },
  {
    id: 'maintenance',
    name: 'Hébergement et maintenance',
    tagline: 'Le même hébergement, plus nous pour tenir le site à jour.',
    price: 59,
    period: 'mois',
    features: [
      'Tout le pack Hébergement',
      'Vos modifications de contenu : textes, photos, horaires, tarifs',
      'Corrections des anomalies que vous nous signalez',
      'Support par mail et par téléphone, réponse sous deux jours ouvrés',
      'Un point une fois par an sur l’état du site',
    ],
  },
] as const;

export const OPTIONS: readonly Option[] = [
  {
    name: 'Pack contenu',
    description: 'Rédaction de vos pages et de vos articles de blog, à l’article ou en forfait.',
    price: 'sur devis',
  },
  {
    name: 'Emailing',
    description: 'Mise en place de l’envoi de mails : transactionnel et newsletter.',
    price: 'sur devis',
  },
  {
    name: 'Pages supplémentaires',
    description: 'Au-delà des 5 pages incluses, conception et intégration à l’unité.',
    price: '180 € / page',
  },
  {
    name: 'Identité visuelle',
    description: 'Logo, palette et règles typographiques si vous partez de zéro.',
    price: 'sur devis',
  },
] as const;

/** What makes a quote move, used on the Offers page. */
export const PRICE_FACTORS: readonly string[] = [
  'Le nombre de pages et la complexité des gabarits',
  'Le contenu : le vôtre est prêt, ou nous le rédigeons',
  'L’existence d’une identité visuelle exploitable',
  'Les options SEO et GEO retenues',
  'Les intégrations tierces : réservation, paiement, cartographie',
] as const;

/** Budget brackets offered in the contact form, aligned on the formulas. */
export const BUDGET_BRACKETS: readonly string[] = [
  'Moins de 1 500 €',
  'De 1 500 à 2 500 €',
  'De 2 500 à 4 000 €',
  'Plus de 4 000 €',
  'Je ne sais pas encore',
] as const;
