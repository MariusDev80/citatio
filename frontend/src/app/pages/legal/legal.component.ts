import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * LegalComponent – page regroupant les mentions légales,
 * la politique de confidentialité et les conditions générales
 * d'utilisation (CGU).
 *
 * Accessible uniquement depuis les liens du footer.
 * Chaque section possède un id pour permettre la navigation
 * par fragment (#mentions, #confidentialite, #cgu).
 */
@Component({
  selector: 'app-legal',
  templateUrl: './legal.html',
  styleUrl: './legal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalComponent {}
