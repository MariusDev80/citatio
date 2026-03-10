import { ChangeDetectionStrategy, Component } from '@angular/core';
import { COMPANY } from '../../config/company.config';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.html',
  styleUrl: './legal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalComponent {
  protected readonly company = COMPANY;
}
