import { test, expect } from '@playwright/test';

/**
 * Tests de non-régression — SEO, navigation et garde-fous de la refonte.
 *
 * Ces tests tournent contre le dist/ pré-rendu servi statiquement, pas un
 * serveur live : ils vérifient donc ce que voient réellement les crawlers.
 */

test.describe('Page d\'accueil — SEO', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('le titre de la page est correct', async ({ page }) => {
    await expect(page).toHaveTitle(/Citatio — studio web près de Nantes/i);
  });

  test('la meta description mentionne l\'ancrage local', async ({ page }) => {
    const meta = page.locator('meta[name="description"]');
    await expect(meta).toHaveAttribute('content', /Loire-Atlantique/i);
  });

  test('les balises Open Graph sont présentes', async ({ page }) => {
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Citatio/i);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /citatio-geo\.com/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /citatio-geo\.com/);
  });

  test('le script JSON-LD Organization est présent', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"][data-jsonld="organization"]');
    await expect(jsonLd).toHaveCount(1);
    const schema = JSON.parse((await jsonLd.textContent())!);
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toContain('Citatio');
  });

  test('le contenu est dans le HTML pré-rendu, pas injecté par JS', async ({ page }) => {
    // Le rendu serveur est un argument commercial affiché sur /ce-site :
    // ce test empêche une régression silencieuse vers du rendu client.
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText(/sites vitrines/i);
  });
});

test.describe('Page FAQ — JSON-LD', () => {
  test('le script JSON-LD FAQPage est présent et valide', async ({ page }) => {
    await page.goto('/faq');
    const jsonLd = page.locator('script[type="application/ld+json"][data-jsonld="faq"]');
    await expect(jsonLd).toHaveCount(1);
    const schema = JSON.parse((await jsonLd.textContent())!);
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity.length).toBeGreaterThan(0);
  });
});

test.describe('Page Offres — tarifs et données structurées', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
  });

  test('des prix sont affichés, pas « sur devis » partout', async ({ page }) => {
    // Garde-fou de la refonte : trois « Sur devis » bloquaient toute décision.
    await expect(page.getByText(/1\s*200\s*€/).first()).toBeVisible();
    await expect(page.getByText(/39\s*€/).first()).toBeVisible();
  });

  test('les offres portent un prix dans le JSON-LD', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"][data-jsonld="services"]');
    await expect(jsonLd).toHaveCount(1);
    const schema = JSON.parse((await jsonLd.textContent())!);
    const first = schema.itemListElement[0].item;
    expect(first.offers.priceCurrency).toBe('EUR');
    expect(Number(first.offers.price)).toBeGreaterThan(0);
  });

  test('aucun badge de fausse preuve sociale', async ({ page }) => {
    await expect(page.getByText(/le plus demandé|le plus populaire/i)).toHaveCount(0);
  });
});

test.describe('Page Ce site — la preuve', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ce-site');
  });

  test('la page est pré-rendue avec son h1', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/portfolio/i);
  });

  test('les mesures sont datées', async ({ page }) => {
    await expect(page.getByText(/relev[ée]s? au/i).first()).toBeVisible();
  });

  test('le JSON-LD Dataset expose la date de mesure', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"][data-jsonld="proof-dataset"]');
    await expect(jsonLd).toHaveCount(1);
    const schema = JSON.parse((await jsonLd.textContent())!);
    expect(schema['@type']).toBe('Dataset');
    expect(schema.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

test.describe('Navigation', () => {
  test('la navbar contient les liens principaux', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: /navigation principale/i });
    await expect(nav.getByRole('link', { name: /^offres$/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /^ce site$/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /^faq$/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /parlons de votre projet/i })).toBeVisible();
  });

  test('navigation vers la page offres', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^offres$/i }).first().click();
    await expect(page).toHaveURL('/services');
  });

  test('navigation vers la page preuve', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^ce site$/i }).first().click();
    await expect(page).toHaveURL('/ce-site');
  });

  test('la page 404 s\'affiche sur une URL inconnue', async ({ page }) => {
    await page.goto('/cette-page-n-existe-pas');
    await expect(page.getByRole('heading', { name: /n.existe pas/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /retour à l.accueil/i })).toBeVisible();
  });
});

test.describe('Accessibilité de base', () => {
  const pages = ['/', '/services', '/ce-site', '/about', '/faq', '/contact', '/legal'];

  for (const path of pages) {
    test(`${path} — un h1 unique et visible`, async ({ page }) => {
      await page.goto(path);
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toHaveCount(1);
      await expect(h1).toBeVisible();
    });
  }

  test('les images ont des attributs alt', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('img:not([alt])')).toHaveCount(0);
  });

  test('les champs du formulaire de contact ont un label', async ({ page }) => {
    await page.goto('/contact');
    for (const id of ['name', 'email', 'projectType', 'message']) {
      await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
    }
  });

  test('un envoi invalide affiche des erreurs au lieu d\'échouer en silence', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: /préparer mon message/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });
});

test.describe('Garde-fous de la refonte', () => {
  test('aucune police n\'est chargée depuis Google Fonts', async ({ page }) => {
    // Argument affiché sur /ce-site : les polices sont auto-hébergées.
    const external: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (/fonts\.(googleapis|gstatic)\.com/.test(url)) {
        external.push(url);
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(external).toEqual([]);
  });

  test('le thème sombre bascule bien la classe racine', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const wasDark = await html.evaluate((el) => el.classList.contains('dark'));
    await page.getByRole('button', { name: /passer au thème/i }).first().click();
    await expect
      .poll(() => html.evaluate((el) => el.classList.contains('dark')))
      .toBe(!wasDark);
  });
});
