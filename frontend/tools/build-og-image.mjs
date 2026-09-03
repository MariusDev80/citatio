import { chromium } from '@playwright/test';

/**
 * Renders tools/og-image.html to public/og-citatio.png (1200x630).
 *
 * The card is hand-written HTML rather than a design export so the wording
 * stays in sync with the site copy: change the eyebrow or headline there, run
 * this, commit the PNG.
 *
 *   npm run build:og
 */
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(new URL('og-image.html', import.meta.url).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og-citatio.png' });
await browser.close();
console.log('public/og-citatio.png regenere');
