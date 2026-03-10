import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService } from './theme.service';

// JSDOM n'implémente pas window.matchMedia — mock minimal requis
function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe('ThemeService — navigateur', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    mockMatchMedia(false);
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('démarre en mode clair par défaut', () => {
    expect(service.isDark()).toBe(false);
  });

  it('toggle passe en dark et ajoute la classe sur <html>', () => {
    service.toggle();
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('double toggle revient en clair', () => {
    service.toggle();
    service.toggle();
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persiste la préférence dans localStorage', () => {
    service.toggle();
    expect(localStorage.getItem('citatio-dark-mode')).toBe('true');
  });

  it('lit la préférence persistée au démarrage', () => {
    localStorage.setItem('citatio-dark-mode', 'true');
    // Recréer le service pour qu'il lise le localStorage
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    const freshService = TestBed.inject(ThemeService);
    expect(freshService.isDark()).toBe(true);
  });
});

describe('ThemeService — serveur (SSR)', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    service = TestBed.inject(ThemeService);
  });

  it('retourne false (clair) côté serveur sans accéder à localStorage', () => {
    expect(service.isDark()).toBe(false);
  });

  it('toggle ne plante pas côté serveur', () => {
    expect(() => service.toggle()).not.toThrow();
  });
});
