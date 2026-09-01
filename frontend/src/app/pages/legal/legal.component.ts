import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.html',
  styleUrl: './legal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalComponent {
  private readonly jsonLd = inject(JsonLdService);

  protected readonly company = COMPANY;

  constructor() {
    this.jsonLd.setSchema('breadcrumb-legal', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Mentions légales', item: COMPANY.url + '/legal' },
      ],
    });

    inject(DestroyRef).onDestroy(() => this.jsonLd.removeSchema('breadcrumb-legal'));
  }
}
