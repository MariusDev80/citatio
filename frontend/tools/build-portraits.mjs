import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';

/**
 * Recadre les portraits en 4:5 et les encode en WebP.
 *
 * Passe par Chrome plutot que sips : sips ignore l'orientation EXIF au
 * recadrage (il travaille sur le buffer non pivote, ce qui decadrait la photo
 * de Marius), et ne sait pas ecrire de WebP sur cette machine.
 *
 * 440x550 = exactement 2x le rendu (220px CSS), ce qui couvre les ecrans a
 * haute densite courants. A 640px, Lighthouse signalait 78 Ko inutiles.
 */
const SRC = process.env.HOME + '/Desktop/Photos site/';
const OUT = 'public/team/';
const TARGET_W = 440, TARGET_H = 550;
const TOP_BIAS = 0.15;   // on rogne surtout par le bas : la tete est en haut

const files = { titouan: 'Titouan.jpeg', marius: 'Marius.jpeg', ruben: 'Ruben.jpg' };

const b = await chromium.launch();
const p = await b.newPage();

for (const [slug, file] of Object.entries(files)) {
  const data = 'data:image/jpeg;base64,' + readFileSync(SRC + file).toString('base64');
  const b64 = await p.evaluate(async ({ src, TW, TH, BIAS }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const ratio = TW / TH;
    let sw = img.naturalWidth, sh = Math.round(img.naturalWidth / ratio);
    if (sh > img.naturalHeight) { sh = img.naturalHeight; sw = Math.round(sh * ratio); }
    const sx = Math.round((img.naturalWidth - sw) / 2);
    const sy = Math.round((img.naturalHeight - sh) * BIAS);
    const c = document.createElement('canvas');
    c.width = TW; c.height = TH;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TW, TH);
    return c.toDataURL('image/webp', 0.88).split(',')[1];
  }, { src: data, TW: TARGET_W, TH: TARGET_H, BIAS: TOP_BIAS });

  const buf = Buffer.from(b64, 'base64');
  writeFileSync(OUT + slug + '.webp', buf);
  console.log(`${slug.padEnd(9)} ${TARGET_W}x${TARGET_H}  ${(buf.length / 1024).toFixed(0)} Ko`);
}
await b.close();
