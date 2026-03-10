import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly jsonLd = inject(JsonLdService);

  protected readonly submitted = signal(false);
  protected readonly submitSuccess = signal(false);

  protected readonly contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected readonly company = COMPANY;

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

  submitForm(): void {
    this.submitted.set(true);
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.value);
      this.submitSuccess.set(true);
      this.contactForm.reset();
      this.submitted.set(false);
    }
  }
}
