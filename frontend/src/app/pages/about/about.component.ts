import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';

/**
 * One founder. Every string here describes a real person.
 *
 * Rule for future edits: nothing in this block may be invented. Roles come
 * from the Obsidian vault (note 1.2), backgrounds and convictions from the
 * founders themselves. A plausible-sounding sentence written on their behalf
 * would put a false statement about a real person on a public page.
 *
 * What to write, per founder:
 *  - `role`      2–4 words. What you actually do day to day, not a job title
 *                borrowed from a bigger company.
 *  - `background` 2–3 sentences. Where you come from, what you did before, what
 *                you learned there. Concrete beats impressive: a real project,
 *                a real constraint, a real mistake.
 *  - `conviction` 1–2 sentences in the first person. Something you believe
 *                about this work that not everyone agrees with. This is the
 *                line that makes the page unrepeatable, avoid consensus
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
  /** Portrait in `public/team/` (640x800, recadre 4:5), ou `null` si absent. */
  readonly portrait: string | null;
}

@Component({
  selector: 'app-about',
  imports: [RouterLink, NgOptimizedImage],
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
      background:
        'Diplômé du Bachelor management des entreprises d’Audencia, j’ai appris l’innovation et l’automatisation des process chez The Links, puis le développement commercial chez Nepsio Conseil. Je consacre aujourd’hui tout cela à Citatio, l’entreprise que j’ai cofondée : des sites internet pensés pour l’activité de ceux qui les portent.',
      conviction:
        'La plupart des gens qui nous appellent n’ont pas besoin d’un site. Ils ont besoin qu’on comprenne comment ils gagnent leur vie. Le site vient après, s’il sert à quelque chose.',
      portrait: '/team/titouan.webp',
    },
    {
      name: 'Marius',
      fullName: 'Marius Dudouet',
      office: 'Directeur général',
      role: 'Conception et développement',
      background:
        'BTS SIO, puis licence MIAGE en alternance à La Poste, comme développeur full stack. Assez longtemps dans une grande structure pour savoir ce que coûte un logiciel mal fait, et pour préférer l’artisanat au volume.',
      conviction:
        'On peut monter un site en deux heures avec un outil en ligne. Le difficile n’est pas de le monter, c’est de vivre avec pendant cinq ans.',
      portrait: '/team/marius.webp',
    },
    {
      name: 'Ruben',
      fullName: 'Ruben Perrichet',
      office: 'Directeur général',
      role: 'Commerce et administration',
      background:
        'Bac pro en climatisation et chambres froides, un an comme agent de sûreté à la douane de l’aéroport de Nantes, puis neuf mois en plomberie, à poser des salles de bains. Il connaît de l’intérieur les métiers pour lesquels nous travaillons, il en vient.',
      conviction:
        'J’ai posé des salles de bains. Quand un artisan me dit qu’il n’a pas le temps de s’occuper de son site, je sais que ce n’est pas une excuse.',
      portrait: '/team/ruben.webp',
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
    // absent until the bios are written, no invented biography for real people.
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
