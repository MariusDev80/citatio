import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RadarAnimationComponent } from '../../components/radar-animation/radar-animation.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { StatComponent, StatItem } from '../../components/stat/stat.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgOptimizedImage, RadarAnimationComponent, RevealDirective, StatComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  /**
   * Trust-band figures. Honesty rule (young studio): no invented social proof.
   * Only factual / qualitative claims — the single numeric one ("100% sur
   * mesure") is the only item that counts up; the rest are qualitative.
   */
  protected readonly stats = signal<readonly StatItem[]>([
    { value: 100, suffix: '%', label: 'Sur mesure', icon: 'pi pi-sliders-h' },
    { value: null, label: 'Responsive par défaut', icon: 'pi pi-mobile' },
    { value: null, label: 'SEO & GEO en option', icon: 'pi pi-chart-line' },
    { value: null, label: 'En ligne 7j/7', icon: 'pi pi-clock' },
  ]);
}
