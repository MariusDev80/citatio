import { chromium } from '@playwright/test';

/**
 * Dark-mode contrast sweep.
 *
 * Lighthouse only ever audits the light theme, but /ce-site claims AA contrast
 * "en thème clair comme en thème sombre" — this script is what backs that
 * claim. It walks every visible text node on every route, resolves the real
 * painted background, and asserts the WCAG AA ratio for the node's size.
 *
 *   npm run build && npx serve dist/citatio-front/browser -p 4173 --single
 *   npm run check:contrast
 */
const BASE = process.env.BASE_URL ?? 'http://localhost:4173';

const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const parse = (s) => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);

const browser = await chromium.launch();
const page = await browser.newPage({ colorScheme: 'dark' });
const routes = ['/', '/ce-site', '/about', '/services', '/faq', '/contact', '/legal'];
let worst = { r: 99, sel: '', route: '' };
let failures = 0;

for (const route of routes) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  if (!isDark) { console.log(`  ${route}: PAS EN MODE SOMBRE`); continue; }

  const results = await page.evaluate(() => {
    const out = [];
    const bgOf = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        const bg = getComputedStyle(n).backgroundColor;
        if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
        n = n.parentElement;
      }
      return getComputedStyle(document.documentElement).backgroundColor;
    };
    for (const el of document.querySelectorAll('p,h1,h2,h3,a,dt,dd,li,span,label,button')) {
      const txt = (el.textContent || '').trim();
      if (!txt || el.children.length > 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      out.push({
        color: cs.color, bg: bgOf(el),
        size: parseFloat(cs.fontSize), weight: cs.fontWeight,
        sel: el.tagName.toLowerCase() + '.' + (el.className || '').split(' ')[0],
      });
    }
    return out;
  });

  for (const r of results) {
    const large = r.size >= 24 || (r.size >= 18.66 && Number(r.weight) >= 700);
    const need = large ? 3 : 4.5;
    const got = ratio(parse(r.color), parse(r.bg));
    if (got < need) { failures++; console.log(`  ECHEC ${route} ${r.sel} ${got.toFixed(2)}:1 (min ${need})`); }
    if (got < worst.r) worst = { r: got, sel: r.sel, route };
  }
}
console.log(`\nPire ratio observé : ${worst.r.toFixed(2)}:1 — ${worst.sel} sur ${worst.route}`);
console.log(failures === 0 ? 'MODE SOMBRE : aucun échec de contraste AA.' : `MODE SOMBRE : ${failures} échecs.`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
