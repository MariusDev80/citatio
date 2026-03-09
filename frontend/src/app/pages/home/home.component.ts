import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RadarAnimationComponent } from '../../components/radar-animation/radar-animation.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RadarAnimationComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
