import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { FlourishComponent } from '../../shared/components/flourish/flourish.component';
import { MEASURED_ON_LABEL, METRICS } from '../../config/site-metrics.config';

interface Craft {
  readonly numeral: string;
  readonly title: string;
  readonly body: string;
  /** Detail page for this trade, when one exists. */
  readonly path?: string;
  readonly linkLabel?: string;
}

interface Step {
  readonly numeral: string;
  readonly title: string;
  readonly duration: string;
  readonly body: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, RevealDirective, FlourishComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly metrics = METRICS;
  protected readonly measuredOn = MEASURED_ON_LABEL;

  protected readonly craft = signal<readonly Craft[]>([
    {
      numeral: '01',
      title: 'Conception et développement',
      path: '/creation-site-vitrine',
      linkLabel: 'La création de site vitrine',
      body:
        'Nous partons de <strong>votre métier et de vos clients</strong>, pas d’un gabarit à remplir. '
        + 'Maquette, contenu, intégration : le site est <strong>écrit à la main</strong>, page par page.',
    },
    {
      numeral: '02',
      title: 'Référencement, en option',
      path: '/referencement-seo',
      linkLabel: 'Le référencement naturel',
      body:
        'Toute création inclut une <strong>base SEO technique</strong>. Au-delà, le <strong>référencement Google</strong> '
        + 'et la <strong>visibilité dans les réponses des IA</strong> sont deux options distinctes, '
        + 'que l’on active seulement si votre marché le justifie.',
    },
    {
      numeral: '03',
      title: 'Hébergement et maintenance',
      path: '/hebergement-et-maintenance',
      linkLabel: 'Ce que couvre l’abonnement',
      body:
        'Nous hébergeons votre site sur <strong>notre propre infrastructure</strong>, gérons votre nom '
        + 'de domaine et assurons mises à jour, sécurité et sauvegardes. <strong>Un seul '
        + 'interlocuteur, une seule facture.</strong>',
    },
  ]);

  protected readonly steps = signal<readonly Step[]>([
    {
      numeral: '01',
      title: 'Premier échange',
      duration: '30 minutes, gratuit',
      body: 'On comprend votre activité et ce que le site doit vous apporter. <strong>Sans engagement.</strong>',
    },
    {
      numeral: '02',
      title: 'Cadrage et devis',
      duration: 'Sous 5 jours ouvrés',
      body: 'Périmètre, arborescence, contenu à produire et <strong>prix ferme</strong>. Vous décidez ensuite.',
    },
    {
      numeral: '03',
      title: 'Design et développement',
      duration: '3 à 5 semaines',
      body: '<strong>Maquette validée avant la moindre ligne de code</strong>, puis intégration et relectures.',
    },
    {
      numeral: '04',
      title: 'Mise en ligne',
      duration: 'Puis suivi mensuel',
      body: 'Nom de domaine, hébergement, indexation. <strong>Le site vit, nous le maintenons.</strong>',
    },
  ]);
}
