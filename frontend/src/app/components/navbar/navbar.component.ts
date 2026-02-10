import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
}

/**
 * NavbarComponent – navigation principale de l'application.
 *
 * On construit le template manuellement plutôt que d'utiliser [model]
 * du p-menubar afin de bénéficier de `routerLinkActive` natif Angular
 * pour l'indicateur de page active (trait sous le lien).
 */
@Component({
  selector: 'app-navbar',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  protected readonly navItems = signal<NavItem[]>([
    { label: 'Accueil', path: '/', exact: true },
    { label: 'Services', path: '/services' },
    { label: 'Qui sommes nous', path: '/about' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ]);
}
