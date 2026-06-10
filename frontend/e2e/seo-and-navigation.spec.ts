import { test, expect } from '@playwright/test';

/**
 * Tests de non-régression — SEO & meta tags
 *
 * Ces tests vérifient que le HTML pré-rendu (prerender statique)
 * contient bien les balises essentielles au référencement et au GEO.
 * Ils tournent contre le dist/ servi statiquement, pas un serveur live.
 */

test.describe('Page d\'accueil — SEO', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('le titre de la page est correct', async ({ page }) => {
    await expect(page).toHaveTitle(/Citatio — Studio web/);
  });

  test('la meta description est présente', async ({ page }) => {
    const meta = page.locator('meta[name="description"]');
    await expect(meta).toHaveAttribute('content', /visibilité/i);
  });

  test('les balises Open Graph sont présentes', async ({ page }) => {
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Citatio — Studio web/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /citatio-geo\.com/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /citatio-geo\.com/);
  });

  test('le script JSON-LD Organization est présent', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"][data-jsonld="organization"]');
    await expect(jsonLd).toHaveCount(1);
    const content = await jsonLd.textContent();
    const schema = JSON.parse(content!);
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toContain('Citatio');
  });
});

test.describe('Page FAQ — JSON-LD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faq');
  });

  test('le script JSON-LD FAQPage est présent et valide', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"][data-jsonld="faq"]');
    await expect(jsonLd).toHaveCount(1);
    const content = await jsonLd.textContent();
    const schema = JSON.parse(content!);
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity.length).toBeGreaterThan(0);
  });
});

test.describe('Navigation', () => {
  test('la navbar contient les liens principaux', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: /^offres$/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /^faq$/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /^contact$/i })).toBeVisible();
  });

  test('la page 404 s\'affiche sur une URL inconnue', async ({ page }) => {
    await page.goto('/cette-page-n-existe-pas');
    await expect(page.getByRole('heading', { name: /introuvable/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /retour à l'accueil/i })).toBeVisible();
  });

  test('navigation vers la page offres', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^offres$/i }).first().click();
    await expect(page).toHaveURL('/services');
  });
});

test.describe('Accessibilité de base', () => {
  test('la page d\'accueil a un h1 visible', async ({ page }) => {
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
  });

  test('les images ont des attributs alt', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img:not([alt])');
    await expect(images).toHaveCount(0);
  });
});
