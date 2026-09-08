import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';
import { OPTIONS, SUBSCRIPTIONS } from '../../config/pricing.config';
import { formatEuro } from '../../shared/format-euro';
import { FlourishComponent } from '../../shared/components/flourish/flourish.component';

interface Item {
  readonly title: string;
  readonly body: string;
}

/**
 * Spoke page for « hébergement et maintenance ».
 *
 * Les trois autres spokes vendent un travail ponctuel ; celle-ci vend la seule
 * ligne récurrente de l'offre, et c'est aussi la plus mal comprise : un artisan
 * qui a déjà payé un site ne voit pas pourquoi il paye encore chaque mois. La
 * page répond donc d'abord à « qu'est-ce que j'achète », en français courant,
 * avant de donner les deux prix.
 *
 * Règle pour les modifications : rien ici ne décrit l'infrastructure de ce
 * site-ci. Citatio s'héberge sur sa propre pile Docker et Caddy (voir /ce-site
 * et les mentions légales), alors que les sites clients tournent sur des VPS
 * administrés avec un panneau de contrôle. La différence est assumée en bas de
 * page plutôt que gommée : la faire disparaître serait une preuve fausse.
 */
@Component({
  selector: 'app-hosting',
  templateUrl: './hosting.html',
  styleUrl: './hosting.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FlourishComponent],
})
export class HostingComponent {
  private readonly jsonLd = inject(JsonLdService);

  protected readonly subscriptions = SUBSCRIPTIONS;
  protected readonly formatEuro = formatEuro;

  /** Le palier bas, cité dans la copie comme ticket d'entrée. */
  protected readonly entryPrice = SUBSCRIPTIONS[0].price;

  /** Le tarif d'une page en plus, pour dire ce que l'abonnement ne couvre pas. */
  protected readonly extraPagePrice =
    OPTIONS.find((option) => option.name === 'Pages supplémentaires')?.price ?? 'sur devis';

  /**
   * Ce qui tourne, décrit par ce que le client y gagne et non par le nom des
   * logiciels : « sauvegardé ailleurs que sur le serveur » lui sert, « stockage
   * objet S3 » ne lui sert pas, et le second se périme au premier changement
   * de fournisseur.
   */
  protected readonly infrastructure = signal<readonly Item[]>([
    {
      title: 'Des serveurs en France',
      body:
        'Votre site tourne sur des serveurs que nous louons et administrons '
        + 'nous-mêmes, installés en France. Vos données et celles de vos visiteurs '
        + 'ne partent pas à l’autre bout du monde pour être servies.',
    },
    {
      title: 'Un espace séparé par client',
      body:
        'Chaque site a son propre espace, son propre accès et sa propre base de '
        + 'données. Un site voisin qui tombe ou qui se fait attaquer n’emmène pas '
        + 'le vôtre avec lui.',
    },
    {
      title: 'Le cadenas, tenu à jour tout seul',
      body:
        'Le certificat qui affiche « https » et le cadenas dans la barre d’adresse '
        + 'expire tous les trois mois. Il se renouvelle automatiquement, sans que '
        + 'vous ayez à y penser ni à payer un supplément.',
    },
    {
      title: 'Des sauvegardes rangées ailleurs',
      body:
        'Le site est sauvegardé chaque jour, et les copies sont conservées en '
        + 'dehors du serveur. Une sauvegarde qui vit sur la machine qu’elle doit '
        + 'secourir ne sert à rien le jour où cette machine brûle.',
    },
    {
      title: 'Une surveillance qui nous prévient avant vous',
      body:
        'La disponibilité du site est vérifiée en continu. Dans le cas normal, '
        + 'nous voyons la panne et nous la corrigeons avant que vous ayez eu le '
        + 'temps de la constater.',
    },
    {
      title: 'Les mises à jour de sécurité',
      body:
        'Le serveur et les briques qui le font tourner reçoivent leurs correctifs '
        + 'de sécurité. C’est l’entretien invisible qui distingue un site tenu '
        + 'd’un site simplement posé quelque part.',
    },
  ]);

  /**
   * Ce que l'abonnement ne couvre pas. Section volontairement aussi longue que
   * celle des inclus : les litiges sur un contrat récurrent portent toujours
   * sur la frontière, jamais sur le centre.
   */
  protected readonly excluded = signal<readonly Item[]>([
    {
      title: 'Les pages en plus',
      body:
        'Ajouter une page au site est une conception et une intégration, pas une '
        + 'modification de contenu. Elle est facturée à l’unité, au tarif affiché '
        + 'sur la page des offres.',
    },
    {
      title: 'Une refonte',
      body:
        'Changer le design, l’arborescence ou le positionnement est un nouveau '
        + 'projet, avec son devis. L’abonnement entretient le site que nous avons '
        + 'livré, il ne le remplace pas.',
    },
    {
      title: 'L’écriture de vos contenus',
      body:
        'Nous mettons en ligne les textes et les photos que vous nous envoyez. '
        + 'Les rédiger relève du pack contenu, qui se commande à part.',
    },
    {
      title: 'Les sites que nous n’avons pas écrits',
      body:
        'Nous n’hébergeons que les sites sortis de chez nous. Reprendre '
        + 'l’exploitation d’un site dont nous n’avons pas la main sur le code '
        + 'reviendrait à garantir des choix que nous n’avons pas faits.',
    },
  ]);

  constructor() {
    this.jsonLd.setSchema('service-hosting', {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Hébergement et maintenance de site vitrine',
      serviceType: 'Hébergement web et maintenance',
      description:
        'Hébergement du site sur des serveurs administrés par Citatio, avec nom de '
        + 'domaine, certificat HTTPS, sauvegardes quotidiennes hors du serveur, '
        + 'surveillance et mises à jour de sécurité. La formule haute ajoute les '
        + 'modifications de contenu et le support.',
      provider: {
        '@type': 'Organization',
        name: COMPANY.name,
        url: COMPANY.url,
      },
      areaServed: COMPANY.areaServed.map((name) => ({ '@type': 'Place', name })),
      // Un abonnement se décrit avec une UnitPriceSpecification, pas avec un
      // `price` sec : sans la quantité de référence (unitCode MON, un mois),
      // un moteur lit 29 € comme un prix unique et affiche un tarif faux.
      offers: SUBSCRIPTIONS.map((subscription) => ({
        '@type': 'Offer',
        name: subscription.name,
        url: COMPANY.url + '/hebergement-et-maintenance',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: subscription.price,
          priceCurrency: 'EUR',
          valueAddedTaxIncluded: false,
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: 1,
            unitCode: 'MON',
          },
        },
      })),
    });

    this.jsonLd.setSchema('breadcrumb-hosting', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Offres', item: COMPANY.url + '/offres-et-tarifs' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Hébergement et maintenance',
          item: COMPANY.url + '/hebergement-et-maintenance',
        },
      ],
    });

    inject(DestroyRef).onDestroy(() => {
      this.jsonLd.removeSchema('service-hosting');
      this.jsonLd.removeSchema('breadcrumb-hosting');
    });
  }
}
