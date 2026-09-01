import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../config/company.config';

/**
 * One founder. Everything except `name` is owner-supplied copy.
 *
 * ⚠️ TODO(bios): `role`, `background`, `conviction` and the portraits are
 * placeholders. They must be written by Marius, Ruben and Titouan themselves —
 * inventing a plausible-sounding career history would put false statements
 * about real people on a public page, which is exactly the kind of generic
 * filler this redesign exists to remove.
 *
 * What to write, per founder:
 *  - `role`      2–4 words. What you actually do day to day, not a job title
 *                borrowed from a bigger company.
 *  - `background` 2–3 sentences. Where you come from, what you did before, what
 *                you learned there. Concrete beats impressive: a real project,
 *                a real constraint, a real mistake.
 *  - `conviction` 1–2 sentences in the first person. Something you believe
 *                about this work that not everyone agrees with. This is the
 *                line that makes the page unrepeatable — avoid consensus
 *                statements like "je crois en la qualité".
 */
interface Founder {
  readonly name: string;
  readonly role: string;
  readonly background: string;
  readonly conviction: string;
  /** Portrait in `public/team/`, or `null` until a real photo is supplied. */
  readonly portrait: string | null;
}

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  protected readonly company = COMPANY;

  protected readonly founders = signal<readonly Founder[]>([
    {
      name: 'Marius',
      role: 'TODO(bios) — rôle',
      background: 'TODO(bios) — parcours en 2 ou 3 phrases.',
      conviction: 'TODO(bios) — une conviction, à la première personne.',
      portrait: null,
    },
    {
      name: 'Ruben',
      role: 'TODO(bios) — rôle',
      background: 'TODO(bios) — parcours en 2 ou 3 phrases.',
      conviction: 'TODO(bios) — une conviction, à la première personne.',
      portrait: null,
    },
    {
      name: 'Titouan',
      role: 'TODO(bios) — rôle',
      background: 'TODO(bios) — parcours en 2 ou 3 phrases.',
      conviction: 'TODO(bios) — une conviction, à la première personne.',
      portrait: null,
    },
  ]);

  /** Initial shown in the portrait slot while no photo is supplied. */
  protected initial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
