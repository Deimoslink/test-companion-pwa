import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => {
    if ('serviceWorker' in navigator) {
      // Путь к файлу и Scope должны жестко включать имя репозитория GitHub
      navigator.serviceWorker.register('/test-companion-pwa/custom-sw.js', {
        scope: '/test-companion-pwa/'
      })
        .then(reg => console.log('Кастомный SW взлетел! Scope:', reg.scope))
        .catch(err => console.error('Кастомный SW упал при регистрации:', err));
    }
  })
  .catch((err) => console.error(err));
