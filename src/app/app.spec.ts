import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { App } from './app';
import { vi } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// ШАГ 1: Мокаем модуль Ionic до того, как загрузится компонент App.
// Это предотвратит попытку Vitest прочитать директорию @ionic/core/components
vi.mock('@ionic/angular/standalone', () => ({
  IonApp: { render: () => {} },
  IonContent: { render: () => {} },
  IonHeader: { render: () => {} },
  IonToolbar: { render: () => {} },
  IonTitle: { render: () => {} },
  IonButton: { render: () => {} },
  provideIonicAngular: () => []
}));

describe('App', () => {
  const initialState = { layout: { title: 'My PWA App' } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // ШАГ 2: Импортируем App, но теперь он получит наши "заглушки" вместо реального Ionic
      imports: [App],
      providers: [
        provideMockStore({ initialState }),
      ],
      // ШАГ 3: Игнорируем ошибки отрисовки неизвестных элементов в шаблоне
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title from store', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    // Проверяем текст. В моках тег всё равно будет называться ion-title
    const title = compiled.querySelector('ion-title');
    expect(title?.textContent).toContain('My PWA App');
  });
});
