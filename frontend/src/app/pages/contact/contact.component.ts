import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';
import { BUDGET_BRACKETS } from '../../config/pricing.config';

/** Prefilled mail body, see {@link ContactComponent.mailtoHref}. */
const MAIL_SUBJECT = 'Demande de devis pour un site vitrine';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, InputTextModule, TextareaModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly jsonLd = inject(JsonLdService);

  protected readonly company = COMPANY;

  /** Set once the user has attempted a submit, gates error display. */
  protected readonly submitted = signal(false);

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
  });

  /**
   * The form is not wired to a backend yet, `u1-communication` will own that.
   * Rather than pretending, submitting composes a prefilled email the visitor
   * actually sends from their own client, so a real message still reaches us.
   */
  protected readonly mailtoHref = computed(() => {
    const v = this.contactForm.getRawValue();
    const body = [
      `Nom : ${v.name}`,
      `Email : ${v.email}`,
      v.company ? `Entreprise : ${v.company}` : null,
      `Type de projet : ${v.projectType}`,
      v.budget ? `Budget envisagé : ${v.budget}` : null,
      v.deadline ? `Échéance : ${v.deadline}` : null,
      '',
      v.message,
    ]
      .filter((line) => line !== null)
      .join('\n');

    return `mailto:${COMPANY.email}`
      + `?subject=${encodeURIComponent(MAIL_SUBJECT)}`
      + `&body=${encodeURIComponent(body)}`;
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

    inject(DestroyRef).onDestroy(() => {
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

    // Hands off to the visitor's mail client. No silent console.log, and no
    // "message envoyé" banner for a message that was never sent.
    window.location.href = this.mailtoHref();
  }
}
