import { Injectable, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeStore {
  private readonly darkModeState = signal(this.resolveInitialMode());
  private readonly document = inject(DOCUMENT);

  readonly darkMode = this.darkModeState.asReadonly();
  readonly modeLabel = computed(() => (this.darkModeState() ? 'Modo claro' : 'Modo oscuro'));

  constructor() {
    this.applyMode(this.darkModeState());
  }

  toggle(): void {
    const nextValue = !this.darkModeState();
    this.darkModeState.set(nextValue);
    localStorage.setItem('management-tickets-theme', nextValue ? 'dark' : 'light');
    this.applyMode(nextValue);
  }

  private resolveInitialMode(): boolean {
    const storedTheme = localStorage.getItem('management-tickets-theme');
    if (storedTheme) {
      return storedTheme === 'dark';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyMode(isDark: boolean): void {
    this.document.documentElement.classList.toggle('app-dark', isDark);
  }
}
