import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonLdService } from '../../services/json-ld.service';
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
  readonly fullName: string;
  /** Statutory office, used for the Person schema. */
  readonly office: string;
  /** What they actually do day to day. */
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
  private readonly jsonLd = inject(JsonLdService);

  protected readonly company = COMPANY;

  /** Ordre d'affichage : le président d'abord, puis les directeurs généraux. */
  protected readonly founders = signal<readonly Founder[]>([
    {
      name: 'Titouan',
      fullName: 'Titouan Poinot',
      office: 'Président',
      role: 'Commerce et direction',
      background: 'TODO(bios) — parcours en 2 ou 3 phrases.',
      conviction: 'TODO(bios) — une conviction, à la première personne.',
      portrait: null,
    },
    {
      name: 'Marius',
      fullName: 'Marius Dudouet',
      office: 'Directeur général',
      role: 'Conception et développement',
      background: 'TODO(bios) — parcours en 2 ou 3 phrases.',
      conviction: 'TODO(bios) — une conviction, à la première personne.',
      portrait: null,
    },
    {
      name: 'Ruben',
      fullName: 'Ruben Perrichet',
      office: 'Directeur général',
      role: 'Commerce et administration',
      background: 'TODO(bios) — parcours en 2 ou 3 phrases.',
      conviction: 'TODO(bios) — une conviction, à la première personne.',
      portrait: null,
    },
  ]);

  constructor() {
    this.jsonLd.setSchema('breadcrumb-about', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Qui sommes-nous', item: COMPANY.url + '/about' },
      ],
    });

    // Names the three founders as real people attached to the organisation.
    // `jobTitle` is the statutory office from the vault; `description` stays
    // absent until the bios are written — no invented biography for real people.
    this.jsonLd.setSchema('about-page', {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Qui sommes-nous',
      url: COMPANY.url + '/about',
      mainEntity: {
        '@type': 'Organization',
        name: COMPANY.name,
        url: COMPANY.url,
        foundingDate: String(COMPANY.foundingYear),
        founder: this.founders().map((f) => ({
          '@type': 'Person',
          name: f.fullName,
          jobTitle: f.office,
          worksFor: { '@type': 'Organization', name: COMPANY.name },
        })),
        areaServed: COMPANY.areaServed.map((name) => ({ '@type': 'Place', name })),
      },
    });

    inject(DestroyRef).onDestroy(() => {
      this.jsonLd.removeSchema('breadcrumb-about');
      this.jsonLd.removeSchema('about-page');
    });
  }

  /** Initial shown in the portrait slot while no photo is supplied. */
  protected initial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
