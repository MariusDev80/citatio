import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { animationFrameScheduler, filter, fromEvent, throttleTime } from 'rxjs';
import { ThemeService } from '../../services/theme.service';

interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly theme = inject(ThemeService);

  protected readonly menuOpen = signal(false);
  protected readonly isScrolled = signal(false);

  protected readonly navItems = signal<NavItem[]>([
    { label: 'Accueil', path: '/', exact: true },
    { label: 'Offres', path: '/services' },
    { label: 'Qui sommes nous', path: '/about' },
    { label: 'FAQ', path: '/faq' },
  ]);

  private static readonly MOBILE_BREAKPOINT = 768;

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));

    if (this.isBrowser) {
      fromEvent(window, 'scroll')
        .pipe(
          throttleTime(0, animationFrameScheduler),
          takeUntilDestroyed(),
        )
        .subscribe(() => this.isScrolled.set(window.scrollY > 50));
    }
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected onResize(): void {
    if (this.isBrowser && window.innerWidth >= NavbarComponent.MOBILE_BREAKPOINT) {
      this.menuOpen.set(false);
    }
  }
}
