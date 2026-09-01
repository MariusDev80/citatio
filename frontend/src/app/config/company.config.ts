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
   *
   * Source: vault Obsidian « Citatio », notes 1.2 (Fondateurs & Gouvernance),
   * 1.3 (Siège, Capital & Actionnariat), 2.1 (Forme Juridique), complétées et
   * confirmées par le propriétaire pour l'immatriculation et le régime de TVA.
   */
  legal: {
    form: 'société par actions simplifiée (SAS)',
    capital: '1 500 €',
    /** SIREN 105 241 855, établissement 00011. Clé de Luhn vérifiée. */
    siren: '105 241 855',
    siret: '105 241 855 00011',
    rcsCity: 'Nantes',
    /**
     * Régime réel normal, donc assujettie : le numéro intracommunautaire est
     * obligatoire sur le site (art. R123-237 c. com.). Clé 83 calculée depuis
     * le SIREN : (12 + 3 × (SIREN mod 97)) mod 97, et non recopiée.
     */
    vatNumber: 'FR83105241855',
    /**
     * Directeur de la publication : le représentant légal de la société
     * (art. 6 III LCEN). Pour une SAS, le président.
     */
    publicationDirector: 'Titouan Poinot, président',
  },

  /**
   * Hosting provider, which French law requires naming on /legal
   * (art. 6 III LCEN). Source: vault, note 6.1, VPS chez Hostinger.
   * Coordonnees legales publiees par Hostinger dans ses conditions generales.
   */
  hosting: {
    provider: 'Hostinger International Ltd',
    address: '61 Lordou Vironos Street, Lumiel Building, 4e étage, 6023 Larnaca, Chypre',
    phone: '+370 645 03378',
    /** Ours regardless of provider, this part is verifiable from the repo. */
    stack: 'Docker et Caddy, sur un VPS que nous administrons nous-mêmes',
  },

  /**
   * The three founders, president first, same order as the About page, so the
   * Organization schema and the page never disagree on who leads.
   */
  founders: ['Titouan', 'Marius', 'Ruben'] as const,

  /**
   * Service area, surfaced as `areaServed` in the structured data.
   * The whole repositioning is local ("près de Nantes"), so search engines and
   * AI answers need to be told that explicitly, the copy alone is not enough.
   */
  areaServed: [
    'Nantes',
    'La Chapelle-sur-Erdre',
    'Loire-Atlantique',
    'Pays de la Loire',
  ] as const,
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
