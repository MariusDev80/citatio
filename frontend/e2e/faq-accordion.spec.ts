import { test, expect } from '@playwright/test';

/**
 * Les questions de la FAQ sont enveloppees dans un <h2> pour exister dans le
 * plan de la page (PrimeNG rend p-accordion-header en role="button", sans
 * niveau de titre). PrimeNG relie l'en-tete et le contenu par injection de
 * dependances : ce test verifie que le noeud intercale ne rompt pas ce lien,
 * ce qui casserait silencieusement le pliage a la prochaine montee de version.
 */
test.describe('Accordeon de la FAQ', () => {

test('le <h2> enveloppant ne casse ni le pliage ni le lien aria', async ({ page }) => {
  await page.goto('/faq');
  const headers = page.locator('h2.ct-faq-question [role="button"]');
  await expect(headers).toHaveCount(8);

  const second = headers.nth(1);
  await expect(second).toHaveAttribute('aria-expanded', 'false');

  // le contenu doit etre relie a son en-tete
  const controls = await second.getAttribute('aria-controls');
  expect(controls).toBeTruthy();
  const region = page.locator(`#${controls}`);
  await expect(region).toHaveAttribute('aria-labelledby', (await second.getAttribute('id'))!);

  await second.click();
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  await expect(region).toBeVisible();
  await expect(region).toContainText('Le tarif dépend de votre projet');

  await second.click();
  await expect(second).toHaveAttribute('aria-expanded', 'false');

  // navigable au clavier
  await second.focus();
  await page.keyboard.press('Enter');
  await expect(second).toHaveAttribute('aria-expanded', 'true');
});
});
