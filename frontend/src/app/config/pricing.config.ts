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

/** Bundled recurring subscription, hosting + domain + maintenance. */
export const SUBSCRIPTION = {
  price: 39,
  period: 'mois',
  label: 'Hébergement, nom de domaine et maintenance',
  description:
    'Un abonnement unique qui couvre l’hébergement sur notre infrastructure, '
    + 'le renouvellement de votre nom de domaine, les mises à jour de sécurité '
    + 'et les sauvegardes.',
} as const;

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
