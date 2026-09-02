import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { JsonLdService } from './services/json-ld.service';
import { SeoService } from './services/seo.service';
import { COMPANY } from './config/company.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly jsonLd = inject(JsonLdService);
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.init();

    this.jsonLd.setSchema('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: COMPANY.name,
      url: COMPANY.url,
      logo: COMPANY.logo,
      description: COMPANY.description,
      knowsAbout: [...COMPANY.knowsAbout],
      // The agency is three named people and serves a named area. Neither fact
      // was in the structured data, so engines had only the prose to go on.
      founder: COMPANY.founders.map((name) => ({ '@type': 'Person', name })),
      areaServed: COMPANY.areaServed.map((name) => ({ '@type': 'Place', name })),
      foundingDate: String(COMPANY.foundingYear),
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: COMPANY.phone,
        email: COMPANY.email,
        contactType: 'customer service',
        availableLanguage: COMPANY.lang,
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: COMPANY.address.street,
        addressLocality: COMPANY.address.city,
        postalCode: COMPANY.address.postalCode,
        addressCountry: COMPANY.address.country,
      },
      ...(COMPANY.sameAs.length > 0 && { sameAs: [...COMPANY.sameAs] }),
    });

    this.jsonLd.setSchema('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: COMPANY.name,
      url: COMPANY.url,
    });
  }
}
