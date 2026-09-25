import { formatPublishedDate, parseArticleBody } from './blog-format';

describe('parseArticleBody', () => {
  it('sépare les paragraphes sur une ligne vide et garde les retours à la ligne', () => {
    expect(parseArticleBody('Premier.\nSuite du premier.\n\nSecond.')).toEqual([
      { kind: 'paragraph', lines: ['Premier.', 'Suite du premier.'] },
      { kind: 'paragraph', lines: ['Second.'] },
    ]);
  });

  it('reconnaît les intertitres de niveau 2 et 3', () => {
    expect(parseArticleBody('## Le coût\n\n### L’hébergement')).toEqual([
      { kind: 'heading', level: 2, text: 'Le coût' },
      { kind: 'heading', level: 3, text: 'L’hébergement' },
    ]);
  });

  it('reconnaît une liste seulement si toutes ses lignes en sont', () => {
    expect(parseArticleBody('- nom de domaine\n- hébergement')).toEqual([
      { kind: 'list', items: ['nom de domaine', 'hébergement'] },
    ]);
    expect(parseArticleBody('Ce qui est inclus :\n- le domaine')).toEqual([
      { kind: 'paragraph', lines: ['Ce qui est inclus :', '- le domaine'] },
    ]);
  });

  it('ignore les blocs vides et les fins de ligne Windows', () => {
    expect(parseArticleBody('\r\n\r\nUn.\r\n\r\n   \r\n\r\nDeux.\r\n')).toEqual([
      { kind: 'paragraph', lines: ['Un.'] },
      { kind: 'paragraph', lines: ['Deux.'] },
    ]);
  });

  it('laisse le HTML saisi en texte, jamais en balise', () => {
    // Le gabarit l'affiche par interpolation : il reste du texte visible.
    expect(parseArticleBody('<script>alert(1)</script>')).toEqual([
      { kind: 'paragraph', lines: ['<script>alert(1)</script>'] },
    ]);
  });
});

describe('formatPublishedDate', () => {
  it('affiche la date à l’heure de Paris, pas en UTC', () => {
    // 23 h 30 UTC le 14 septembre, soit 1 h 30 le 15 à Paris (heure d'été).
    expect(formatPublishedDate('2026-09-14T23:30:00Z')).toBe('15 septembre 2026');
  });
});
