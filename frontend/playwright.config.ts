/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: './playwright-results',
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    // L'app est servie depuis le dist pré-rendu via http-server dans le CI
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },

  // serve --single : fallback vers index.html pour les routes inconnues (SPA mode)
  webServer: {
    command: 'npx serve dist/citatio-front/browser -p 4173 --single --no-clipboard',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env['CI'],
    timeout: 30000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
