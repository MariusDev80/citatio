import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type FlourishVariant = 'hero' | 'closing';

/**
 * Decorative ribbons that run off the edges of a section.
 *
 * Constraints this component exists to respect, because the site publishes its
 * own Lighthouse scores and would be caught out by any of them:
 *  - no network cost: the SVG is inline, there is no image request;
 *  - no accessibility cost: aria-hidden and pointer-events: none, so it is
 *    absent from the accessibility tree and never intercepts a click;
 *  - no contrast cost: the strokes sit far below the text opacity, and the
 *    variants keep their density away from the columns that carry body copy;
 *  - no motion at all: the strands are static, so there is nothing to gate
 *    behind prefers-reduced-motion and nothing repainting on scroll.
 *
 * The colour is var(--color-accent), so the theme swap carries it: ultramarine
 * on paper, periwinkle on ink, without a second set of values here.
 *
 * Usage: the host section needs `.ct-flourish-host`, which supplies the
 * positioning context and clips the strands at its edges.
 */
@Component({
  selector: 'app-flourish',
  templateUrl: './flourish.html',
  styleUrl: './flourish.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class]': '"ct-flourish ct-flourish--" + variant()',
  },
})
export class FlourishComponent {
  /**
   * Which set of strands to draw. Each variant has its own viewBox and its own
   * empty side, chosen so the ribbons never run under a text column:
   *  - `hero`    enters top right, loops down, leaves right. The h1 and lede
   *              sit on the left third, which stays clear.
   *  - `closing` shallow loops in the right third, for the final call to action.
   *
   * Both enter from the right edge, deliberately: one recurring gesture reads
   * as a signature, several different ones read as decoration. An earlier
   * horizontal-wave variant was dropped for the same reason, it competed with
   * the horizontal rules the whole site is built on.
   *
   * Two rules keep the drawing whole whatever the host section measures, since
   * `.ct-flourish-host` clips at its own edges:
   *  - every strand starts and ends beyond x=1440, so no endpoint is ever left
   *    dangling inside the frame;
   *  - every turn stays inside the viewBox, which is anchored to the bottom
   *    (`xMaxYMax`) so that the height `slice` has to drop is taken off the
   *    top, where the strands run off the frame by design.
   */
  readonly variant = input.required<FlourishVariant>();
}
