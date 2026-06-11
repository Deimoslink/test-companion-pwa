import {
  ApplicationConfig,
  isDevMode, provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { authReducer } from '@state/auth/auth.reducer';
import { AuthEffects } from '@state/auth/auth.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      if ('serviceWorker' in navigator) {
        return navigator.serviceWorker.register('/test-companion-pwa/sw.js')
        .catch(err => console.error('SW registration failed:', err));
      }
      return Promise.resolve();
    }),
    provideIonicAngular({
      swipeBackEnabled: false,
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({
      auth: authReducer,
    }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
  ],
};
