import {
  Directive,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * `ctReveal` — scroll-reveal directive (free, CSS + IntersectionObserver).
 *
 * On enter-viewport it adds `is-visible` to play the CSS transition declared
 * by `.ct-reveal` (see `styles.css`). One-shot: it unobserves after the first
 * reveal so the animation never replays.
 *
 * Why this shape (the non-obvious parts):
 * - **SSR-safe / hydration-safe.** No DOM access in the constructor or via
 *   lifecycle hooks that run on the server. We only touch the DOM inside
 *   `afterNextRender()` (browser-only by contract) and additionally guard on
 *   `isPlatformBrowser`. Touching `IntersectionObserver` / `window` during SSR
 *   would crash the render and break hydration.
 * - **The hidden state is opt-in from JS, never the server default.** The
 *   `.ct-reveal` hidden state only bites under `html.ct-js` (added at bootstrap).
 *   So if JS is disabled or before hydration, content is fully visible — no
 *   "blank until JS" flash, no SEO content hidden from crawlers.
 * - **Reduced-motion.** If the user asked for reduced motion we do nothing:
 *   we neither create an observer nor rely on the transition. CSS also forces
 *   the final state globally (double safety), so the element stays visible.
 *
 * Stagger is driven from the template via `[style.transition-delay.ms]` on the
 * host, or via the optional {@link revealDelay} input which sets that same
 * delay (kept here so callers can stagger without inline styles).
 */
@Directive({
  selector: '[ctReveal]',
  host: {
    '[style.transition-delay.ms]': 'revealDelay()',
  },
})
export class RevealDirective {
  /** Stagger delay in ms applied to the reveal transition (0 = no delay). */
  readonly revealDelay = input(0, { alias: 'ctRevealDelay' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    // `afterNextRender` runs only in the browser, after the first paint — the
    // safe place to read media queries and wire up an IntersectionObserver.
    afterNextRender(() => {
      if (!this.isBrowser) {
        return;
      }

      const el = this.host.nativeElement;

      // Honor the user's motion preference: skip the hidden state entirely so
      // the content is shown immediately, no animation, no observer.
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (prefersReducedMotion) {
        return;
      }

      // Apply the hidden state from JS (so it's gated on a real browser), then
      // reveal when the element scrolls into view.
      el.classList.add('ct-reveal');

      if (typeof IntersectionObserver === 'undefined') {
        // Very old / unusual environments: degrade gracefully to visible.
        el.classList.add('is-visible');
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              el.classList.add('is-visible');
              observer.unobserve(el);
              observer.disconnect();
            }
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
      );

      observer.observe(el);
    });
  }
}
