export const COMPANY = {
  name: 'Citatio',
  legalName: 'Citatio',
  url: 'https://citatio-geo.com',
  logo: 'https://citatio-geo.com/citatio_logo.png',
  ogImage: 'https://citatio-geo.com/og-citatio.png',
  locale: 'fr_FR',
  lang: 'French',
  description:
    'Citatio est une agence web qui crée des sites vitrines sur mesure pour les TPE, PME et indépendants, avec le référencement Google (SEO) et la visibilité sur l\'IA (GEO) en option, plus l\'hébergement, le nom de domaine et la maintenance.',
  shortDescription:
    'Agence web : sites vitrines sur mesure, avec SEO et visibilité IA (GEO) en option.',
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
   *
   * This block is the identity record: legal name, statutory office, and the
   * profiles that corroborate the person elsewhere on the web. The About page
   * owns the editorial half (role, background, conviction, portrait) and merges
   * the two by `name`, so neither file can drift from the other.
   *
   * `sameAs` is what lets an engine tie the person on this page to the same
   * person on LinkedIn or GitHub. Only add a URL that the person actually
   * controls and that names them: a wrong link here is a false claim about a
   * real person, and it also poisons the entity for everyone else.
   */
  founders: [
    {
      name: 'Titouan',
      fullName: 'Titouan Poinot',
      office: 'Président',
      sameAs: ['https://www.linkedin.com/in/titouan-poinot/'],
    },
    {
      name: 'Marius',
      fullName: 'Marius Dudouet',
      office: 'Directeur général',
      sameAs: [
        'https://www.linkedin.com/in/marius-dudouet/',
        'https://github.com/MariusDev80',
      ],
    },
    {
      name: 'Ruben',
      fullName: 'Ruben Perrichet',
      office: 'Directeur général',
      sameAs: ['https://www.linkedin.com/in/ruben-perrichet-682076433/'],
    },
  ] as const,

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
    'Agence web',
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
  /**
   * Fiche Google Business Profile, sous sa forme canonique par CID.
   * L'URL Maps longue porte des parametres de session (`entry`, `g_ep`, `skid`)
   * qui changent a chaque partage ; la forme `?cid=` est stable dans le temps.
   * CID 0x73e977b496b34132 = 8352338601441444146 en decimal.
   */
  googleBusinessProfile: 'https://maps.google.com/?cid=8352338601441444146',

  /** Coordonnees de la fiche, pour relier le site au point sur la carte. */
  geo: { latitude: 47.3047519, longitude: -1.5564386 },

  /** Horaires declares sur la fiche Google : 9h-18h, sept jours sur sept. */
  openingHours: { opens: '09:00', closes: '18:00' },

  /** Categorie principale de la fiche Google. */
  googleCategory: 'Concepteur de sites Web',

  /**
   * Profils officiels de l'entreprise. Chaque entree est un point de
   * corroboration : c'est ce qui permet a un moteur, ou a un modele, de
   * rattacher « Citatio » a une entite reelle plutot qu'a une chaine de
   * caracteres vue sur un seul site.
   */
  sameAs: [
    'https://maps.google.com/?cid=8352338601441444146',
    'https://www.linkedin.com/company/citatio-geo/',
  ] as string[],
} as const;
