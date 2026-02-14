import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { ButtonModule } from 'primeng/button';

interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
}

/**
 * NavbarComponent – navigation principale de l'application.
 *
 * Sur desktop les liens sont affichés en ligne dans la barre.
 * Sur mobile (< 768px) un bouton hamburger permet d'ouvrir/fermer
 * un menu déroulant vertical.
 *
 * Le menu se ferme automatiquement après chaque navigation et
 * lorsqu'on redimensionne la fenêtre au-delà du breakpoint mobile.
 */
@Component({
  selector: 'app-navbar',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class NavbarComponent {
  private readonly router = inject(Router);

  /** Whether the mobile menu is currently expanded. */
  protected readonly menuOpen = signal(false);

  protected readonly navItems = signal<NavItem[]>([
    { label: 'Accueil', path: '/', exact: true },
    { label: 'Services', path: '/services' },
    { label: 'Qui sommes nous', path: '/about' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ]);

  private static readonly MOBILE_BREAKPOINT = 768;

  constructor() {
    // Ferme le menu mobile après chaque navigation réussie.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));
  }

  /** Toggle l'état du menu mobile. */
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** Ferme le menu si la fenêtre dépasse le breakpoint mobile. */
  protected onResize(): void {
    if (window.innerWidth >= NavbarComponent.MOBILE_BREAKPOINT) {
      this.menuOpen.set(false);
    }
  }
}
