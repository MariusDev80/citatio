import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

/**
 * Static server for the e2e suite, mirroring frontend/nginx.conf.
 *
 * It replaces `serve --single`, which returned the home page for EVERY route:
 * every e2e test was therefore exercising the client-side SPA fallback, and
 * the prerendered pages, the whole point of this site's SEO, were covered by
 * nothing. It also made the canonical test flaky, since it only passed once
 * Angular had hydrated and rewritten the tag.
 *
 * Resolution order, the same three rules as the nginx config:
 *   1. the file itself            (`try_files $uri`)
 *   2. the directory's index.html (`try_files $uri/index.html`)
 *   3. otherwise 404 carrying the SPA body, so Angular renders its not-found
 *      page under a real 404 status  (`error_page 404 /index.html`)
 */
const ROOT = process.argv[2] ?? 'dist/citatio-front/browser';
const PORT = Number(process.argv[3] ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const readIfFile = async (path) => {
  try {
    if (!(await stat(path)).isFile()) return null;
    return await readFile(path);
  } catch {
    return null;
  }
};

createServer(async (req, res) => {
  // normalize() collapses any ../ before the path is joined to ROOT.
  const url = new URL(req.url, 'http://localhost');
  const path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  const target = join(ROOT, path);

  const body = (await readIfFile(target)) ?? (await readIfFile(join(target, 'index.html')));
  if (body) {
    res.writeHead(200, { 'Content-Type': TYPES[extname(target).toLowerCase()] ?? TYPES['.html'] });
    res.end(body);
    return;
  }

  const fallback = await readIfFile(join(ROOT, 'index.html'));
  res.writeHead(404, { 'Content-Type': TYPES['.html'] });
  res.end(fallback ?? 'Not found');
}).listen(PORT, () => console.log(`dist servi sur http://localhost:${PORT} (regles nginx)`));
