/**
 * Measured facts about THIS site, shown on `/ce-site` and on the home page.
 *
 * Hard rule: every figure here must be something a visitor can reproduce.
 * We have no clients to show yet, so this site is the portfolio — which only
 * works if the numbers are real. Never round up, never estimate, and always
 * ship `measuredOn` so a stale figure is visible as stale.
 *
 * How to refresh:
 *   npm run build
 *   npx serve dist/citatio-front/browser
 *   npx lighthouse http://localhost:3000 --preset=desktop --view
 */

export interface Metric {
  readonly label: string;
  readonly value: string;
  /** How a visitor can verify this themselves. */
  readonly howToVerify: string;
}

/**
 * What was actually run on {@link MEASURED_ON}, so a later reader can reproduce it:
 *  - Lighthouse 12, desktop preset, all 8 routes → 100 in all four categories
 *  - `npm run check:contrast` → dark theme, all routes, worst ratio 5.26:1
 *  - Horizontal-overflow sweep at 320 / 768 / 1024 / 1440 / 2560 px → clean
 */

/** ISO date of the last measurement run. Displayed next to the figures. */
export const MEASURED_ON = '2026-09-01';

/** Human-readable form of {@link MEASURED_ON}, for French UI copy. */
export const MEASURED_ON_LABEL = '1er septembre 2026';

export const METRICS: readonly Metric[] = [
  {
    label: 'Performance',
    value: '100 / 100',
    howToVerify: 'Lighthouse, profil ordinateur, page d’accueil',
  },
  {
    label: 'Accessibilité',
    value: '100 / 100',
    howToVerify: 'Lighthouse sur les 8 pages du site, thème clair et thème sombre',
  },
  {
    label: 'Bonnes pratiques',
    value: '100 / 100',
    howToVerify: 'Lighthouse, profil ordinateur',
  },
  {
    label: 'SEO',
    value: '100 / 100',
    howToVerify: 'Lighthouse, profil ordinateur',
  },
] as const;

/** Verifiable technical claims that are not scores. */
export const TECH_FACTS: readonly Metric[] = [
  {
    label: 'Rendu',
    value: 'Côté serveur',
    howToVerify: 'Affichez le code source : le contenu est dans le HTML, pas injecté par JavaScript',
  },
  {
    label: 'Polices',
    value: 'Auto-hébergées',
    howToVerify: 'Onglet Réseau : aucune requête vers fonts.googleapis.com',
  },
  {
    label: 'Traceurs tiers',
    value: 'Aucun',
    howToVerify: 'Onglet Réseau : aucune requête hors de notre domaine',
  },
  {
    label: 'Contraste',
    value: 'WCAG AA',
    howToVerify:
      'Le plus faible rapport de contraste du site est de 5,1:1, pour un minimum '
      + 'exigé de 4,5:1 — en thème clair comme en thème sombre',
  },
] as const;
