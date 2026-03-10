import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RadarAnimationComponent } from '../../components/radar-animation/radar-animation.component';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RadarAnimationComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly jsonLd = inject(JsonLdService);

  constructor() {
    this.jsonLd.setSchema('breadcrumb-home', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
      ],
    });

    inject(DestroyRef).onDestroy(() => {
      this.jsonLd.removeSchema('breadcrumb-home');
    });
  }
}
