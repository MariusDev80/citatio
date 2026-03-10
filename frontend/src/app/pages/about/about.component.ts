import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly jsonLd = inject(JsonLdService);

  constructor() {
    this.jsonLd.setSchema('breadcrumb-about', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'À propos', item: COMPANY.url + '/about' },
      ],
    });

    inject(DestroyRef).onDestroy(() => {
      this.jsonLd.removeSchema('breadcrumb-about');
    });
  }
}
