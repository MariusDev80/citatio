import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';

/**
 * Les questions de la FAQ sont des <details> natifs, apres qu'un accordeon
 * PrimeNG se soit revele incapable de s'ouvrir sur une page prerendue : son
 * composant <p-motion> restaurait les styles masques venus du serveur, si bien
 * qu'aucune reponse ne s'ouvrait sur le site en ligne. Le bug etait invisible
 * tant que la suite tournait derriere `serve --single`, qui renvoyait la page
 * d'accueil pour toutes les routes et donc ne prerendait jamais la FAQ.
 *
 * Ces tests verifient donc les trois proprietes qui comptent : le depliage
 * fonctionne, les questions existent dans le plan de la page, et les reponses
 * sont dans le HTML prerendu meme fermees.
 */
test.describe('Questions de la FAQ', () => {
  test('une question s’ouvre, se referme, et repond au clavier', async ({ page }) => {
    await page.goto('/faq');

    const items = page.locator('details.ct-faq-item');
    await expect(items).toHaveCount(19);

    const item = page.locator('details.ct-faq-item', {
      hasText: 'Que couvre l’abonnement mensuel ?',
    });
    const answer = item.locator('.ct-faq-answer');

    await expect(item).not.toHaveAttribute('open', /.*/);
    await expect(answer).toBeHidden();

    await item.locator('summary').click();
    await expect(answer).toBeVisible();
    await expect(answer).toContainText('pas d’engagement de durée');

    await item.locator('summary').click();
    await expect(answer).toBeHidden();

    // <summary> est focalisable et s'active a la barre d'espace comme a Entree.
    await item.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(answer).toBeVisible();
  });

  test('chaque question est un titre de niveau 3', async ({ page }) => {
    await page.goto('/faq');
    // Quatre rubriques en h2, dix-neuf questions en h3 : sans cela les
    // questions n'apparaissent dans aucun plan de page.
    await expect(page.locator('summary h3.ct-faq-question')).toHaveCount(19);
  });

  test('les montants affiches viennent de pricing.config, pas d’une copie', async ({ page }) => {
    await page.goto('/faq');
    const answer = page
      .locator('details.ct-faq-item', { hasText: 'Combien coûte un site vitrine ?' })
      .locator('.ct-faq-answer');
    // Espace fine insecable (U+202F) entre le millier et le symbole, comme
    // partout ailleurs sur le site.
    await expect(answer).toContainText('1\u202f000 €');
    await expect(answer).toContainText('1\u202f750 €');
    await expect(answer).toContainText('2\u202f500 €');
  });

  test('les reponses sont dans le HTML prerendu, meme fermees', () => {
    // Ce que voient les moteurs et les IA. On lit l'artefact de prerendu sur
    // disque : c'est lui que nginx sert en production.
    const html = readFileSync(
      join(process.cwd(), 'dist/citatio-front/browser/faq/index.html'),
      'utf8',
    );
    for (const extrait of [
      'Nos prix sont publics',
      'Trente minutes, gratuit, sans engagement',
      'Non, et personne ne le peut honn',
      'Ni boutique en ligne, ni application m',
    ]) {
      expect(html).toContain(extrait);
    }
  });
});
