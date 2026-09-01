export const COMPANY = {
  name: 'Citatio',
  legalName: 'Citatio',
  url: 'https://citatio-geo.com',
  logo: 'https://citatio-geo.com/citatio_logo.png',
  ogImage: 'https://citatio-geo.com/og-citatio.png',
  locale: 'fr_FR',
  lang: 'French',
  description:
    'Citatio est un studio web qui crée des sites vitrines sur mesure pour les TPE, PME et indépendants, avec le référencement Google (SEO) et la visibilité sur l\'IA (GEO) en option, plus l\'hébergement, le nom de domaine et la maintenance.',
  shortDescription:
    'Studio web : sites vitrines sur mesure, avec SEO et visibilité IA (GEO) en option.',
  email: 'contact@citatio-geo.com',
  phone: '+33-7-67-47-83-72',
  phoneRaw: '+33767478372',
  phoneDisplay: '+33 7 67 47 83 72',
  address: {
    street: '1 rue de l\'Aven',
    city: 'La Chapelle-sur-Erdre',
    postalCode: '44240',
    country: 'FR',
  },
  priceRange: '€€',
  foundingYear: 2025,

  /**
   * Legal identity, surfaced on /legal and in the footer.
   * TODO(legal): fill these in — the Legal page shipped with visible
   * `[forme juridique]` / `[numéro SIRET]` placeholders, which is both a
   * credibility problem and a French compliance one.
   */
  legal: {
    form: 'À COMPLÉTER',
    siret: 'À COMPLÉTER',
    capital: 'À COMPLÉTER',
    rcsCity: 'À COMPLÉTER',
    publicationDirector: 'À COMPLÉTER',
    vatNumber: 'À COMPLÉTER',
  },

  /**
   * We run this site on the same stack we sell — that is part of the pitch,
   * and French law requires naming the host on /legal.
   * TODO(legal): fill in the actual VPS provider, its legal name, address and
   * phone. The provider is currently only known to the CI (`VPS_IP` secret),
   * so it is deliberately left blank rather than guessed.
   */
  hosting: {
    provider: 'À COMPLÉTER',
    address: 'À COMPLÉTER',
    phone: 'À COMPLÉTER',
    /** Ours regardless of provider — this part is verifiable from the repo. */
    stack: 'Docker et Caddy, sur un VPS que nous administrons nous-mêmes',
  },

  /** The three founders. Bios live in the About page component. */
  founders: ['Marius', 'Ruben', 'Titouan'] as const,
  knowsAbout: [
    'Création de site vitrine',
    'Studio web',
    'Web design',
    'Développement web sur mesure',
    'Accessibilité web',
    'SEO',
    'Référencement Google',
    'Generative Engine Optimization',
    'GEO',
    'Visibilité IA',
    'Hébergement web',
  ],
  sameAs: [] as string[],
} as const;
