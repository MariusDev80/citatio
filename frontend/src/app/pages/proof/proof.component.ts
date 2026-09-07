import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';
import {
  MEASURED_ON,
  MEASURED_ON_LABEL,
  METRICS,
  TECH_FACTS,
} from '../../config/site-metrics.config';
import { FlourishComponent } from '../../shared/components/flourish/flourish.component';

interface Choice {
  readonly title: string;
  readonly body: string;
}

/**
 * `/ce-site` : the portfolio stand-in.
 *
 * Citatio has no client work to show yet and will not fabricate any, so this
 * page makes the site itself the deliverable on display. Everything asserted
 * here must be reproducible by the reader; figures come from
 * `site-metrics.config.ts` and carry their measurement date.
 */
@Component({
  selector: 'app-proof',
  imports: [RouterLink, FlourishComponent],
  templateUrl: './proof.html',
  styleUrl: './proof.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProofComponent {
  private readonly jsonLd = inject(JsonLdService);

  protected readonly company = COMPANY;
  protected readonly metrics = METRICS;
  protected readonly techFacts = TECH_FACTS;
  protected readonly measuredOn = MEASURED_ON_LABEL;

  protected readonly choices = signal<readonly Choice[]>([
    {
      title: 'Rendu côté serveur',
      body:
        'Les pages sont générées à l’avance et servies en <strong>HTML complet</strong>. Google et '
        + 'les moteurs IA lisent le contenu sans exécuter de JavaScript, et la '
        + 'première image de la page s’affiche immédiatement.',
    },
    {
      title: 'Deux polices, auto-hébergées',
      body:
        'Instrument Serif pour les titres, Geist pour le texte, servies depuis '
        + 'notre serveur. <strong>Aucune requête vers Google Fonts</strong> : rien de ce que vous '
        + 'lisez ici n’informe un tiers de votre visite.',
    },
    {
      title: 'Aucun traceur',
      body:
        '<strong>Pas d’analytics tiers, pas de pixel publicitaire</strong>, pas de bannière de '
        + 'consentement, parce qu’il n’y a rien à consentir. Le site ne dépose '
        + 'qu’une préférence de thème, dans votre navigateur.',
    },
    {
      title: 'Accessible au clavier et au lecteur d’écran',
      body:
        '<strong>Contrastes conformes AA</strong> en thème clair comme en thème sombre, structure '
        + 'de titres cohérente, focus visible partout, et toute animation coupée '
        + 'si votre système demande à réduire les animations.',
    },
    {
      title: 'Hébergé par nous',
      body:
        'Le site tourne dans des conteneurs Docker derrière Caddy, sur un serveur '
        + 'que nous administrons. <strong>C’est la même infrastructure que celle proposée '
        + 'à nos clients</strong> : nous en sommes les premiers utilisateurs.',
    },
    {
      title: 'Déployé automatiquement',
      body:
        'Chaque modification passe par une intégration continue qui construit, '
        + 'teste et déploie. <strong>Une correction demandée le matin peut être en ligne '
        + 'l’après-midi</strong>, sans intervention manuelle sur le serveur.',
    },
  ]);

  constructor() {
    this.jsonLd.setSchema('breadcrumb-proof', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Ce site', item: COMPANY.url + '/ce-site' },
      ],
    });

    // Expose the measurement date as a machine-readable dataset so the claims
    // on this page are dated for AI crawlers too, not just human readers.
    this.jsonLd.setSchema('proof-dataset', {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: 'Mesures de performance et d’accessibilité du site Citatio',
      description:
        'Scores Lighthouse et caractéristiques techniques vérifiables du site citatio-geo.com.',
      dateModified: MEASURED_ON,
      creator: { '@type': 'Organization', name: COMPANY.name, url: COMPANY.url },
      variableMeasured: METRICS.map((m) => ({
        '@type': 'PropertyValue',
        name: m.label,
        value: m.value,
      })),
    });

    inject(DestroyRef).onDestroy(() => {
      this.jsonLd.removeSchema('breadcrumb-proof');
      this.jsonLd.removeSchema('proof-dataset');
    });
  }
}
