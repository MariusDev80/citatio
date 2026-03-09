import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-services',
  templateUrl: './services.html',
  styleUrl: './services.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent {}
