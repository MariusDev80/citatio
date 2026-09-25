/**
 * Consigne aux moteurs pour tout le blog, tant qu'il n'est pas ouvert.
 *
 * Deux raisons de le tenir hors des index : la publication n'est pas protégée,
 * et les pages sont rendues côté client, donc une adresse d'article inconnue
 * répond 200 (un « soft 404 »). Le blog sort du noindex quand ces deux points
 * sont réglés, et entre alors dans sitemap.xml et llms.txt (CLAUDE.md §7).
 */
export const BLOG_ROBOTS = 'noindex, nofollow';

/**
 * Mise en forme du texte d'un article.
 *
 * Le texte d'un article est saisi en brut, avec trois conventions :
 *
 *   - une ligne vide sépare deux blocs ;
 *   - un bloc qui commence par `## ` (ou `### `) est un intertitre ;
 *   - un bloc dont toutes les lignes commencent par `- ` est une liste.
 *
 * Tout le reste est un paragraphe, dont les retours à la ligne sont conservés.
 *
 * Pourquoi pas Markdown : il faudrait une bibliothèque (le site tient à 100 en
 * partie parce qu'il en a peu), puis insérer son HTML par `innerHTML`, donc
 * dépendre du nettoyage d'Angular pour tout ce qu'un auteur colle dans le
 * champ. Ici le texte devient des blocs typés, rendus par le gabarit : aucune
 * balise saisie ne peut atteindre le DOM. Les liens et l'emphase attendront
 * qu'un article en ait réellement besoin.
 */
export type ArticleBlock =
  /** `level` 2 ou 3 : le h1 est le titre de l'article, jamais le texte. */
  | { kind: 'heading'; level: 2 | 3; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'paragraph'; lines: string[] };

const LIST_ITEM = /^[-*]\s+/;

export function parseArticleBody(body: string): ArticleBlock[] {
  return body
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.split('\n').map((line) => line.trim()).filter((line) => line !== ''))
    .filter((lines) => lines.length > 0)
    .map(toBlock);
}

function toBlock(lines: string[]): ArticleBlock {
  const [first] = lines;
  // `###` testé avant `##`, qui en est un préfixe.
  if (lines.length === 1 && first.startsWith('### ')) {
    return { kind: 'heading', level: 3, text: first.slice(4).trim() };
  }
  if (lines.length === 1 && first.startsWith('## ')) {
    return { kind: 'heading', level: 2, text: first.slice(3).trim() };
  }
  if (lines.every((line) => LIST_ITEM.test(line))) {
    return { kind: 'list', items: lines.map((line) => line.replace(LIST_ITEM, '')) };
  }
  return { kind: 'paragraph', lines };
}

/**
 * Date de publication lisible, à l'heure de Paris.
 *
 * Fuseau fixé plutôt que celui du navigateur : un article publié à 0 h 30 ne
 * doit pas afficher la veille chez un lecteur à Montréal et le jour même à
 * Nantes. `Intl` plutôt que `DatePipe` : la locale `fr` n'est pas enregistrée
 * dans l'application, et l'enregistrer pour une date ajouterait ses données au
 * bundle de toutes les pages.
 */
const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Paris',
});

export function formatPublishedDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}
