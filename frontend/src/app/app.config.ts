import {
  ApplicationConfig,
  PLATFORM_ID,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import CitatioPreset from './theme/citatio-preset';
import { routes } from './app.routes';

/**
 * "Cutting the mustard": flag the document as JS-capable as early as possible
 * in the browser. CSS scroll-reveal hidden states (`.ct-reveal`) only apply
 * under `html.ct-js`, so the server-rendered / no-JS HTML is always visible —
 * no content hidden from crawlers, no blank flash before hydration.
 */
function markJsCapable(): void {
  if (isPlatformBrowser(inject(PLATFORM_ID))) {
    document.documentElement.classList.add('ct-js');
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(markJsCapable),
    provideAnimationsAsync(),
    provideClientHydration(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    providePrimeNG({
      theme: {
        preset: CitatioPreset,
        options: {
          darkModeSelector: '.dark',
        },
      },
    }),
  ],
};
