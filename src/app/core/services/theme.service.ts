import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const isDark = this.isDarkMode();
      this.applyThemeToDocument(isDark);
      localStorage.setItem('user-theme', isDark ? 'dark' : 'light');
    });
  }

  public toggleTheme() {
    this.isDarkMode.update(dark => !dark);
  }

  private getInitialTheme(): boolean {
    const savedTheme = localStorage.getItem('user-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyThemeToDocument(isDark: boolean) {
    const root = document.documentElement;
    root.classList.toggle('ion-palette-dark', isDark);
    root.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
  }
}
