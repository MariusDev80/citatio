import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-radar-animation',
  templateUrl: './radar-animation.html',
  styleUrl: './radar-animation.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dark-mode]': 'theme.isDark()',
  },
})
export class RadarAnimationComponent {
  protected readonly theme = inject(ThemeService);
}
