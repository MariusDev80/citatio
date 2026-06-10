import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * One trust-band item.
 *
 * `value` is the only animated part: a real, defensible number (e.g. 100 for
 * "100% sur mesure"). Qualitative items (no number) pass `value: null` and are
 * rendered as a static icon + label that simply reveals — see the honesty note
 * in the component doc.
 */
export interface StatItem {
  /** Numeric value to count up to, or `null` for a qualitative (non-numeric) stat. */
  readonly value: number | null;
  /** Suffix appended to the number (e.g. '%'). Ignored when `value` is null. */
  readonly suffix?: string;
  /** Visible label under the figure (French UI copy). */
  readonly label: string;
  /** PrimeIcons class, e.g. 'pi pi-check-circle'. */
  readonly icon: string;
}

/**
 * `ct-stat` — a single animated/qualitative trust indicator.
 *
 * Honesty guard (business rule): Citatio is a young studio, so we never invent
 * social proof (no fake client counts, ratings or logos). Only the *numeric*
 * stats we pass are factual & defensible (e.g. "100% sur mesure"), and only
 * those animate. Qualitative promises ("Responsive par défaut", "SEO & GEO en
 * option"…) render as icon + label.
 *
 * SSR / no-JS / reduced-motion: the FINAL value is the default render — the
 * count signal starts at the target, never at a frozen "0". The 0→value tween
 * is decorative and runs only in the browser, only when motion is allowed, and
 * only once the element enters the viewport.
 *
 * a11y: the morphing digits are `aria-hidden`; the host exposes the final value
 * via `aria-label`, so assistive tech always reads the real figure.
 */
@Component({
  selector: 'ct-stat',
  templateUrl: './stat.html',
  styleUrl: './stat.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'group',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class StatComponent {
  readonly stat = input.required<StatItem>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Animation duration of the count-up tween, in ms. */
  private static readonly TWEEN_MS = 1600;

  /** True when this item carries a real, animatable number. */
  protected readonly isNumeric = computed(() => this.stat().value !== null);

  /**
   * Live tween value, or `null` while no tween has started. `null` means
   * "render the final value" — which is why SSR / no-JS / reduced motion always
   * show the truth (we never read the required input in a field initializer,
   * and we never freeze a literal "0"). It's only set to 0 → target in the
   * browser when motion is allowed.
   */
  private readonly count = signal<number | null>(null);

  /** Full figure to display, e.g. "100%". Falls back to the final input value. */
  protected readonly displayValue = computed(() => {
    const current = this.count() ?? this.stat().value ?? 0;
    return `${current}${this.stat().suffix ?? ''}`;
  });

  /** Accessible label: "100% — 100% sur mesure" or just the label for qualitative items. */
  protected readonly ariaLabel = computed(() => {
    const s = this.stat();
    if (s.value === null) {
      return s.label;
    }
    return `${s.value}${s.suffix ?? ''} — ${s.label}`;
  });

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser) {
        return;
      }

      const target = this.stat().value;
      if (target === null) {
        return; // qualitative item: nothing to animate
      }

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
        return; // keep the final value already rendered
      }

      // Browser + motion allowed: start the figure at 0 now (avoids a visible
      // snap-back from the final value), then tween up once it scrolls in.
      this.count.set(0);

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              observer.unobserve(this.host.nativeElement);
              observer.disconnect();
              this.tween(target);
            }
          }
        },
        { threshold: 0.4 },
      );

      observer.observe(this.host.nativeElement);
    });
  }

  /** Ease-out count-up from 0 to {@link target} via requestAnimationFrame. */
  private tween(target: number): void {
    const start = performance.now();
    const step = (now: number): void => {
      const progress = Math.min((now - start) / StatComponent.TWEEN_MS, 1);
      // easeOutCubic for a snappy, non-linear feel.
      const eased = 1 - Math.pow(1 - progress, 3);
      this.count.set(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.count.set(target);
      }
    };
    requestAnimationFrame(step);
  }
}
