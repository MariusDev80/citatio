import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';
import {
  FORMULAS,
  OPTIONS,
  PRICE_FACTORS,
  SUBSCRIPTION,
} from '../../config/pricing.config';
import { formatEuro } from '../../shared/format-euro';

@Component({
  selector: 'app-services',
  templateUrl: './services.html',
  styleUrl: './services.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class ServicesComponent {
  private readonly jsonLd = inject(JsonLdService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly formulas = FORMULAS;
  protected readonly options = OPTIONS;
  protected readonly subscription = SUBSCRIPTION;
  protected readonly priceFactors = PRICE_FACTORS;

  protected readonly formatEuro = formatEuro;

  constructor() {
    const provider = { '@type': 'Organization', name: COMPANY.name };

    // Offers now carry a real `offers.price`, which makes them eligible for
    // rich results, one concrete benefit of dropping « Sur devis ».
    this.jsonLd.setSchema('services', {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Offres ${COMPANY.name}`,
      itemListElement: FORMULAS.map((formula, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Service',
          name: formula.name,
          description: `${formula.tagline} ${formula.features.join('. ')}.`,
          provider,
          offers: {
            '@type': 'Offer',
            price: formula.from,
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'PriceSpecification',
              minPrice: formula.from,
              priceCurrency: 'EUR',
              valueAddedTaxIncluded: false,
            },
          },
        },
      })),
    });

    this.jsonLd.setSchema('breadcrumb-services', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Offres', item: COMPANY.url + '/offres-et-tarifs' },
      ],
    });

    this.destroyRef.onDestroy(() => {
      this.jsonLd.removeSchema('services');
      this.jsonLd.removeSchema('breadcrumb-services');
    });
  }
}
