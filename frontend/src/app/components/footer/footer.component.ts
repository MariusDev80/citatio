import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../config/company.config';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly company = COMPANY;

  /** Computed once per render rather than hardcoded — a stale copyright year
   *  is a small thing that reads as an abandoned site. */
  protected readonly year = new Date().getFullYear();
}
