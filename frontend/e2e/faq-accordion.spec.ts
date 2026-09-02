import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';

/**
 * Les questions de la FAQ sont enveloppees dans un titre pour exister dans le
 * plan de la page (PrimeNG rend p-accordion-header en role="button", sans
 * niveau de titre). PrimeNG relie l'en-tete et le contenu par injection de
 * dependances : ce test verifie que le noeud intercale ne rompt pas ce lien,
 * ce qui casserait silencieusement le pliage a la prochaine montee de version.
 */
test.describe('Accordeon de la FAQ', () => {

test('le titre enveloppant ne casse ni le pliage ni le lien aria', async ({ page }) => {
    await page.goto('/faq');
    const headers = page.locator('h3.ct-faq-question [role="button"]');
    await expect(headers).toHaveCount(18);

    // Aucun panneau n'est ouvert au chargement, voir le commentaire de faq.html.
    const target = page.locator('h3.ct-faq-question', {
      hasText: 'Que couvre l’abonnement mensuel ?',
    }).locator('[role="button"]');
    await expect(target).toHaveAttribute('aria-expanded', 'false');

    // le contenu doit etre relie a son en-tete
    const controls = await target.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const region = page.locator(`#${controls}`);
    await expect(region).toHaveAttribute('aria-labelledby', (await target.getAttribute('id'))!);

    await target.click();
    await expect(target).toHaveAttribute('aria-expanded', 'true');
    await expect(region).toBeVisible();
    await expect(region).toContainText('pas d’engagement de durée');

    await target.click();
    await expect(target).toHaveAttribute('aria-expanded', 'false');

    // navigable au clavier
    await target.focus();
    await page.keyboard.press('Enter');
    await expect(target).toHaveAttribute('aria-expanded', 'true');
  });

  test('les montants affiches viennent de pricing.config, pas d’une copie', async ({ page }) => {
    await page.goto('/faq');
    const prix = page.locator('h3.ct-faq-question', {
      hasText: 'Combien coûte un site vitrine ?',
    }).locator('[role="button"]');
    await prix.click();
    const region = page.locator(`#${await prix.getAttribute('aria-controls')}`);
    // Espace fine insecable (U+202F) entre le millier et le symbole, comme
    // partout ailleurs sur le site.
    await expect(region).toContainText('1\u202f200 €');
    await expect(region).toContainText('1\u202f900 €');
    await expect(region).toContainText('2\u202f800 €');
  });

  test('les reponses sont dans le HTML prerendu, meme repliees', () => {
    // Ce que voient les moteurs et les IA. Si un jour le contenu n'etait plus
    // rendu qu'a l'ouverture du panneau, la page perdrait d'un coup ses dix-huit
    // reponses aux yeux de Google, sans que rien ne casse visuellement.
    //
    // On lit l'artefact de prerendu sur disque plutot que de le demander au
    // serveur de test : celui-ci tourne avec --single et reecrit aussi bien
    // /faq que /faq/index.html vers la page d'accueil.
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
