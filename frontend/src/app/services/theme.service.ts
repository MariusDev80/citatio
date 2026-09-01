import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

/**
 * ThemeService : manages the dark / light mode toggle.
 *
 * Toggles the `.dark` class on `<html>` so that both Tailwind CSS
 * (`darkMode: 'class'`) and PrimeNG (`darkModeSelector: '.dark'`)
 * react to the same source of truth.
 *
 * Persists the user's preference in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly STORAGE_KEY = 'citatio-dark-mode';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly isDark = signal(this.loadInitialPreference());

  constructor() {
    this.applyClass(this.isDark());
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    this.applyClass(next);
    if (this.isBrowser) {
      localStorage.setItem(ThemeService.STORAGE_KEY, JSON.stringify(next));
    }
  }

  private loadInitialPreference(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    const stored = localStorage.getItem(ThemeService.STORAGE_KEY);
    if (stored !== null) {
      try {
        return JSON.parse(stored) === true;
      } catch {
        return false;
      }
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyClass(dark: boolean): void {
    if (this.isBrowser) {
      document.documentElement.classList.toggle('dark', dark);
    }
  }
}
