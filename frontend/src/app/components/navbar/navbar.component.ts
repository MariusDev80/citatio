import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

/**
 * NavbarComponent utilise le composant `p-menubar` de PrimeNG qui gère nativement
 * le responsive (burger menu), les sous-menus, et l'accessibilité ARIA.
 * Les items de navigation sont définis via un signal pour rester cohérent
 * avec l'architecture réactive Angular 21.
 */
@Component({
  selector: 'app-navbar',
  imports: [MenubarModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  protected readonly menuItems = signal<MenuItem[]>([
    { label: 'Accueil', icon: 'pi pi-home', routerLink: '/' },
    { label: 'Qui sommes nous', icon: 'pi pi-users', routerLink: '/about' },
    { label: 'FAQ', icon: 'pi pi-question-circle', routerLink: '/faq' },
    { label: 'Contact', icon: 'pi pi-envelope', routerLink: '/contact' },
  ]);
}
