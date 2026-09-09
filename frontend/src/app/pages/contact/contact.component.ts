import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ContactService } from '../../services/contact.service';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';
import { BUDGET_BRACKETS } from '../../config/pricing.config';

/**
 * Etat de l'envoi.
 *
 * <p>Quatre etats explicites plutot que deux booleens croises : la page doit
 * pouvoir distinguer « pas encore envoye » de « envoi en cours », et surtout ne
 * jamais afficher un succes qui n'en est pas un. Le formulaire annoncait
 * autrefois « message envoye » alors que rien ne partait ; ici, `success` n'est
 * pose que sur une reponse du serveur.
 */
export type SubmissionStatus = 'idle' | 'sending' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, RouterLink, InputTextModule, TextareaModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly jsonLd = inject(JsonLdService);
  private readonly contact = inject(ContactService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly company = COMPANY;

  /** Set once the user has attempted a submit, gates error display. */
  protected readonly submitted = signal(false);

  /** Etat de l'envoi, pilote l'affichage du formulaire et du bouton. */
  protected readonly status = signal<SubmissionStatus>('idle');

  /** Titre de l'accuse de reception, present seulement en etat `success`. */
  private readonly successHeading = viewChild<ElementRef<HTMLElement>>('successHeading');

  protected readonly projectTypes = [
    'Création d’un premier site',
    'Refonte d’un site existant',
    'Site + référencement (SEO)',
    'Site + visibilité IA (GEO)',
    'Je ne sais pas encore',
  ];

  protected readonly budgets = BUDGET_BRACKETS;

  protected readonly deadlines = [
    'Dès que possible',
    'Dans les 3 mois',
    'Dans les 6 mois',
    'Pas de date arrêtée',
  ];

  protected readonly contactForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    company: [''],
    projectType: ['', Validators.required],
    budget: [''],
    deadline: [''],
    message: ['', [Validators.required, Validators.minLength(20)]],
    // requiredTrue et non required : sur une case a cocher, `required` accepte
    // la valeur false, qui est justement le refus.
    consent: [false, Validators.requiredTrue],
    // Leurre anti-robot, masque et hors parcours clavier (voir le gabarit).
    // Aucun validateur : un visiteur ne peut pas le remplir, et une erreur
    // apprendrait au robot quel champ eviter.
    website: [''],
  });

  constructor() {
    this.jsonLd.setSchema('local-business', {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: COMPANY.name,
      url: COMPANY.url,
      telephone: COMPANY.phone,
      email: COMPANY.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: COMPANY.address.street,
        addressLocality: COMPANY.address.city,
        postalCode: COMPANY.address.postalCode,
        addressCountry: COMPANY.address.country,
      },
      description: COMPANY.description,
      priceRange: COMPANY.priceRange,
      areaServed: COMPANY.areaServed.map((name) => ({ '@type': 'Place', name })),
      founder: COMPANY.founders.map((f) => ({
        '@type': 'Person',
        name: f.fullName,
        jobTitle: f.office,
        sameAs: [...f.sameAs],
      })),
      // Relie explicitement le site a la fiche Google Business Profile :
      // meme point sur la carte, memes horaires, meme identite.
      sameAs: [...COMPANY.sameAs],
      hasMap: COMPANY.googleBusinessProfile,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: COMPANY.geo.latitude,
        longitude: COMPANY.geo.longitude,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday',
          'Friday', 'Saturday', 'Sunday',
        ],
        opens: COMPANY.openingHours.opens,
        closes: COMPANY.openingHours.closes,
      },
    });

    this.jsonLd.setSchema('breadcrumb-contact', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Contact', item: COMPANY.url + '/contact' },
      ],
    });

    // Le formulaire disparait au profit de l'accuse de reception : sans
    // deplacer le focus, un lecteur d'ecran resterait sur un bouton qui n'existe
    // plus et n'annoncerait rien. Un role="status" seul ne suffit pas non plus,
    // une region live inseree en meme temps que son contenu est souvent ignoree.
    // L'effet ne se declenche qu'au navigateur : `success` est impossible au
    // rendu serveur, ou l'etat vaut toujours `idle`.
    effect(() => this.successHeading()?.nativeElement.focus());

    this.destroyRef.onDestroy(() => {
      this.jsonLd.removeSchema('local-business');
      this.jsonLd.removeSchema('breadcrumb-contact');
    });
  }

  /** True once the field is both invalid and worth complaining about. */
  protected showError(field: string): boolean {
    const control = this.contactForm.get(field);
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  protected submitForm(): void {
    this.submitted.set(true);

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      // Send focus to the first field in error so keyboard and screen-reader
      // users are not left guessing why nothing happened.
      const firstInvalid = Object.keys(this.contactForm.controls).find(
        (key) => this.contactForm.get(key)?.invalid,
      );
      if (firstInvalid) {
        document.getElementById(firstInvalid)?.focus();
      }
      return;
    }

    this.status.set('sending');
    this.contact
      .submit(this.contactForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.status.set('success');
          // Le formulaire disparait au profit de l'accuse de reception, mais on
          // le remet a zero : revenir sur la page ne doit pas reproposer un
          // brouillon deja envoye.
          this.contactForm.reset();
          this.submitted.set(false);
        },
        // Aucun detail technique a l'ecran : un statut HTTP ou un message de
        // pile ne dit rien d'utile au visiteur. Le message d'erreur du gabarit
        // rappelle l'adresse et le telephone, qui eux marchent toujours.
        error: () => this.status.set('error'),
      });
  }
}
