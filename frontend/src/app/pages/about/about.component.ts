import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';
import { FlourishComponent } from '../../shared/components/flourish/flourish.component';

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
/**
 * The editorial half of a founder. Legal name, statutory office and `sameAs`
 * profiles live in COMPANY.founders and are merged in by `name` below, so the
 * page and the Organization schema cannot disagree about who these people are.
 */
interface FounderProfile {
  readonly name: string;
  /** What they actually do day to day. */
  readonly role: string;
  readonly background: string;
  readonly conviction: string;
  /** Portrait in `public/team/` (640x800, recadre 4:5), ou `null` si absent. */
  readonly portrait: string | null;
}

@Component({
  selector: 'app-about',
  imports: [RouterLink, NgOptimizedImage, FlourishComponent],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly jsonLd = inject(JsonLdService);

  protected readonly company = COMPANY;

  /** Ordre d'affichage : le président d'abord, puis les directeurs généraux. */
  private readonly profiles = signal<readonly FounderProfile[]>([
    {
      name: 'Titouan',
      role: 'Commerce et direction',
      background:
        'Diplômé du Bachelor management des entreprises d’Audencia, j’ai appris l’innovation et l’automatisation des process chez The Links, puis le développement commercial chez Nepsio Conseil. Je consacre aujourd’hui tout cela à <strong>Citatio, l’entreprise que j’ai cofondée</strong> : des sites internet pensés pour l’activité de ceux qui les portent.',
      conviction:
        'La plupart des gens qui nous appellent n’ont pas besoin d’un site. Ils ont besoin qu’on comprenne comment ils gagnent leur vie. Le site vient après, s’il sert à quelque chose.',
      portrait: '/team/titouan.webp',
    },
    {
      name: 'Marius',
      role: 'Conception et développement',
      background:
        'BTS SIO, puis licence MIAGE en alternance à La Poste, comme développeur full stack. Assez longtemps dans une grande structure pour savoir ce que coûte un logiciel mal fait, et pour <strong>préférer l’artisanat au volume</strong>.',
      conviction:
        'On peut monter un site en deux heures avec un outil en ligne. Le difficile n’est pas de le monter, c’est de vivre avec pendant cinq ans.',
      portrait: '/team/marius.webp',
    },
    {
      name: 'Ruben',
      role: 'Commerce et administration',
      background:
        'Bac pro en climatisation et chambres froides, un an comme agent de sûreté à la douane de l’aéroport de Nantes, puis neuf mois en plomberie, à poser des salles de bains. <strong>Je connais de l’intérieur les métiers pour lesquels nous travaillons</strong>, j’en viens.',
      conviction:
        'J’ai posé des salles de bains. Quand un artisan me dit qu’il n’a pas le temps de s’occuper de son site, je sais que ce n’est pas une excuse.',
      portrait: '/team/ruben.webp',
    },
  ]);

  /**
   * Editorial profile joined with the identity record from COMPANY.founders.
   * The join is on `name` and throws if an entry is missing, so removing a
   * founder from one file and not the other fails loudly at first render
   * rather than silently dropping a person from the page.
   */
  /**
   * Nomme la plateforme d'un profil a partir de son hote. Deliberement une
   * liste explicite : un domaine inconnu doit se voir, pas s'afficher sous une
   * etiquette generique qui masquerait une URL collee par erreur.
   */
  protected profileLabel(url: string): string {
    const host = new URL(url).hostname.replace(/^www\./, '');
    switch (host) {
      case 'linkedin.com':
        return 'LinkedIn';
      case 'github.com':
        return 'GitHub';
      default:
        return host;
    }
  }

  protected readonly founders = computed(() =>
    this.profiles().map((profile) => {
      const identity = COMPANY.founders.find((f) => f.name === profile.name);
      if (!identity) {
        throw new Error(
          `Fondateur « ${profile.name} » absent de COMPANY.founders : les deux listes ont divergé.`,
        );
      }
      return { ...profile, ...identity };
    }),
  );

  constructor() {
    this.jsonLd.setSchema('breadcrumb-about', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Qui sommes-nous', item: COMPANY.url + '/qui-sommes-nous' },
      ],
    });

    // Names the three founders as real people attached to the organisation.
    // `jobTitle` is the statutory office from the vault; `description` stays
    // absent until the bios are written, no invented biography for real people.
    this.jsonLd.setSchema('about-page', {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Qui sommes-nous',
      url: COMPANY.url + '/qui-sommes-nous',
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
          // Corroboration de l'identite hors du site. C'est ce qui distingue
          // une personne reelle d'un nom pose sur une page.
          sameAs: [...f.sameAs],
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
