/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: './playwright-results',
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    // L'app est servie depuis le dist pré-rendu, avec les règles de nginx.
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },

  // `serve --single` renvoyait index.html pour TOUTES les routes : les tests
  // ne voyaient jamais les pages prérendues, seulement le SPA après hydratation.
  // tools/serve-dist.mjs applique les mêmes règles que frontend/nginx.conf.
  webServer: {
    command: 'node tools/serve-dist.mjs dist/citatio-front/browser 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env['CI'],
    timeout: 30000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
