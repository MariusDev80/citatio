import { test, expect, Page, Route } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * Blog : liste, rédaction, lecture.
 *
 * La suite tourne contre le dist statique, sans backend : l'API u2-blog est
 * simulée par `page.route`, avec les formes de réponse des records Java
 * (ArticlePage, ArticleDetail, Problem Details).
 */

const CATEGORIES = [
  { code: 'SITE_VITRINE', label: 'Site vitrine' },
  { code: 'SEO', label: 'Référencement' },
  { code: 'GEO', label: 'Visibilité IA' },
  { code: 'HEBERGEMENT', label: 'Hébergement' },
  { code: 'AGENCE', label: 'Vie de l’agence' },
];

// PNG de 1 x 1 pixel, pour que l'image s'affiche réellement.
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

const ARTICLE = {
  slug: 'combien-coute-un-site-vitrine',
  title: 'Combien coûte un site vitrine',
  excerpt: 'Ce que coûte un site vitrine, poste par poste, et ce qui fait varier le prix.',
  author: 'Marius Dudouet',
  publishedAt: '2026-09-15T08:00:00Z',
  categories: [CATEGORIES[0], CATEGORIES[1]],
  imageUrl: '/api/u2/articles/combien-coute-un-site-vitrine/image',
  imageAlt: 'Devis posé sur un comptoir de boulangerie',
  body: 'Un site vitrine se paie une fois.\n\n## Ce qui est inclus\n\n- la conception\n- l’hébergement',
};

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

/** API simulée. `articles` sert la liste ; les autres cas se surchargent test par test. */
async function mockApi(page: Page, articles: unknown[] = [ARTICLE]) {
  await page.route('**/api/u2/article-categories', (route) => json(route, CATEGORIES));
  await page.route('**/api/u2/articles?*', (route) =>
    json(route, { items: articles, page: 0, size: 12, totalItems: articles.length, totalPages: 1 }),
  );
  await page.route(`**/api/u2/articles/${ARTICLE.slug}`, (route) => json(route, ARTICLE));
  await page.route(`**/api/u2/articles/${ARTICLE.slug}/image`, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL }),
  );
}

test.describe('Blog, la liste', () => {
  test('répond 200 hors pré-rendu, et reste hors des index', async ({ page }) => {
    await mockApi(page);
    const response = await page.goto('/blog');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/notes d.atelier/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  });

  test('affiche les articles et mène à leur page', async ({ page }) => {
    await mockApi(page);
    await page.goto('/blog');

    const link = page.getByRole('link', { name: ARTICLE.title });
    await expect(link).toBeVisible();
    await expect(page.getByText(ARTICLE.excerpt)).toBeVisible();
    await expect(page.getByText('15 septembre 2026')).toBeVisible();
    await expect(page.getByAltText(ARTICLE.imageAlt)).toBeVisible();

    await link.click();
    await expect(page).toHaveURL(`/blog/${ARTICLE.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(ARTICLE.title);
  });

  test('dit qu’il n’y a encore aucun article', async ({ page }) => {
    await mockApi(page, []);
    await page.goto('/blog');
    await expect(page.getByText(/aucun article publié/i)).toBeVisible();
  });

  test('dit que le serveur ne répond pas, au lieu d’une liste vide', async ({ page }) => {
    await page.route('**/api/u2/articles?*', (route) => route.fulfill({ status: 502 }));
    await page.goto('/blog');
    await expect(page.getByRole('alert')).toContainText(/n.ont pas pu être chargés/i);
  });
});

test.describe('Blog, un article', () => {
  test('met en forme le texte et pose ses meta et son JSON-LD', async ({ page }) => {
    await mockApi(page);
    await page.goto(`/blog/${ARTICLE.slug}`);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(ARTICLE.title);
    await expect(page.getByRole('heading', { level: 2, name: 'Ce qui est inclus' })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'la conception' })).toBeVisible();
    await expect(page.getByAltText(ARTICLE.imageAlt)).toBeVisible();

    await expect(page).toHaveTitle(`${ARTICLE.title} | Citatio`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', ARTICLE.excerpt);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');

    const jsonLd = page.locator('script[type="application/ld+json"][data-jsonld="blog-posting"]');
    const schema = JSON.parse((await jsonLd.textContent())!);
    expect(schema['@type']).toBe('BlogPosting');
    expect(schema.author.name).toBe(ARTICLE.author);
  });

  test('une adresse inconnue affiche « cet article n’existe pas »', async ({ page }) => {
    await page.route('**/api/u2/articles/disparu', (route) =>
      json(route, { status: 404, title: 'Not Found' }, 404),
    );
    await page.goto('/blog/disparu');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/cet article n.existe pas/i);
  });

  test('quitter le blog rend la consigne robots par défaut au reste du site', async ({ page }) => {
    await mockApi(page);
    await page.goto(`/blog/${ARTICLE.slug}`);
    await page.getByRole('navigation', { name: /navigation principale/i })
      .getByRole('link', { name: /^faq$/i }).click();
    await expect(page).toHaveURL('/faq');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  });
});

test.describe('Blog, rédaction', () => {
  test('chaque champ a son label', async ({ page }) => {
    await mockApi(page);
    await page.goto('/blog/nouvel-article');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/rédiger un article/i);
    for (const id of ['title', 'excerpt', 'body', 'author', 'image']) {
      await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
    }
    await expect(page.getByRole('checkbox')).toHaveCount(CATEGORIES.length);
  });

  test('un envoi incomplet signale les erreurs et place le focus', async ({ page }) => {
    await mockApi(page);
    await page.goto('/blog/nouvel-article');
    await expect(page.getByRole('checkbox').first()).toBeVisible();

    await page.getByRole('button', { name: /publier l.article/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(page.locator('#title')).toBeFocused();
  });

  test('une image exige sa description', async ({ page }) => {
    await mockApi(page);
    await page.goto('/blog/nouvel-article');

    await page.locator('#image').setInputFiles({ name: 'vitrine.png', mimeType: 'image/png', buffer: PIXEL });
    await expect(page.getByLabel(/description de l.image/i)).toBeVisible();

    await page.getByRole('button', { name: /retirer l.image/i }).click();
    await expect(page.getByLabel(/description de l.image/i)).toHaveCount(0);
  });

  test('refuse un fichier qui n’est pas une image acceptée', async ({ page }) => {
    await mockApi(page);
    await page.goto('/blog/nouvel-article');

    await page.locator('#image').setInputFiles({
      name: 'logo.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
    });
    await expect(page.getByRole('alert')).toContainText(/ni un JPEG, ni un PNG, ni un WebP/);
  });

  test('publie en multipart puis ouvre l’article à l’adresse donnée par le serveur', async ({ page }) => {
    await mockApi(page);
    let posted: { contentType: string | undefined; body: string } | null = null;
    await page.route('**/api/u2/articles', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.fallback();
      }
      posted = {
        contentType: route.request().headers()['content-type'],
        body: route.request().postDataBuffer()?.toString('utf8') ?? '',
      };
      return json(route, ARTICLE, 201);
    });

    await page.goto('/blog/nouvel-article');
    await page.getByLabel('Titre *').fill(ARTICLE.title);
    await page.getByLabel('Chapeau *').fill(ARTICLE.excerpt);
    await page.getByLabel('Texte *').fill(ARTICLE.body);
    await page.getByLabel('Site vitrine').check();
    await page.getByLabel('Référencement').check();
    await page.getByLabel('Auteur *').selectOption(ARTICLE.author);
    await page.locator('#image').setInputFiles({ name: 'vitrine.png', mimeType: 'image/png', buffer: PIXEL });
    await page.getByLabel(/description de l.image/i).fill(ARTICLE.imageAlt);
    await page.getByRole('button', { name: /publier l.article/i }).click();

    await expect(page).toHaveURL(`/blog/${ARTICLE.slug}`);
    expect(posted!.contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(posted!.body).toContain('name="article"');
    expect(posted!.body).toContain('"categories":["SITE_VITRINE","SEO"]');
    expect(posted!.body).toContain(`"imageAlt":"${ARTICLE.imageAlt}"`);
    expect(posted!.body).toContain('name="image"; filename="vitrine.png"');
  });

  test('affiche le motif d’un refus du serveur', async ({ page }) => {
    await mockApi(page);
    await page.route('**/api/u2/articles', (route) =>
      json(route, { status: 400, detail: 'le titre doit faire entre 5 et 140 caracteres' }, 400),
    );

    await page.goto('/blog/nouvel-article');
    await page.getByLabel('Titre *').fill(ARTICLE.title);
    await page.getByLabel('Chapeau *').fill(ARTICLE.excerpt);
    await page.getByLabel('Texte *').fill(ARTICLE.body);
    await page.getByLabel('Site vitrine').check();
    await page.getByLabel('Auteur *').selectOption(ARTICLE.author);
    await page.getByRole('button', { name: /publier l.article/i }).click();

    await expect(page.getByRole('alert')).toContainText('le titre doit faire entre 5 et 140 caracteres');
    await expect(page).toHaveURL('/blog/nouvel-article');
  });
});

test.describe('Blog, garde-fous tant qu’il est fermé', () => {
  // Un blog en noindex listé dans le sitemap enverrait deux consignes
  // contraires aux moteurs. Il y entre le jour où BLOG_ROBOTS est levé.
  test('le blog n’est ni dans le sitemap ni dans llms.txt', () => {
    for (const file of ['public/sitemap.xml', 'public/llms.txt']) {
      expect(readFileSync(file, 'utf8')).not.toContain('/blog');
    }
  });

  test('le blog n’est pas pré-rendu : aucune requête API au build', () => {
    const { routes } = JSON.parse(readFileSync('dist/citatio-front/prerendered-routes.json', 'utf8'));
    expect(Object.keys(routes).filter((route) => route.startsWith('/blog'))).toEqual([]);
    expect(Object.keys(routes)).toHaveLength(11);
  });
});
