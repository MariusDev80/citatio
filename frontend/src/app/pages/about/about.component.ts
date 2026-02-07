import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-about',
  imports: [CardModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {}
