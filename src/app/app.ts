import {Component, inject, OnInit} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {
  IonApp, IonHeader, IonToolbar, IonTitle,
  IonContent, IonRouterOutlet, IonButtons,
  IonButton, IonIcon, IonMenu, IonList, IonItem, IonLabel, IonMenuButton, IonMenuToggle
} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {Store} from '@ngrx/store';
import {AuthActions} from '@state/auth/auth.actions';
import {AppState} from '@state/app.state';
import {filter, mergeMap, startWith, tap} from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router, RouterLink} from '@angular/router';
import {homeOutline, shieldCheckmarkOutline, logOutOutline, settingsOutline, cloudDone, cloudOffline, micOutline, moonOutline, sunnyOutline} from 'ionicons/icons';
import {routes} from './app.routes';
import {ConnectionService} from '@core/services/connection.service';
import {map, Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: ['app.scss'],
  standalone: true,
  imports: [
    IonApp, IonHeader, IonToolbar, IonTitle,
    IonContent, IonRouterOutlet, IonButtons,
    IonButton, IonIcon, AsyncPipe, IonMenu, IonList, IonItem, IonLabel, RouterLink, IonMenuButton, IonMenuToggle
  ],
})
export class App implements OnInit {
  public connectionService = inject(ConnectionService);
  public isOnline = this.connectionService.isOnline;

  isDarkMode = false;

  private readonly store = inject(Store<AppState>);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  public menuItems = routes.filter(route => route.data?.['showInMenu']);

  public userRole$ = this.store.select(state => state.auth.role);

  // public title$ = this.store.select(selectTitle).pipe(
  //   startWith(''),
  //   tap(value => console.log('DEBUG: Текущий тайтл в App:', value))
  // );


  // Стрим для заголовка
  public title$: Observable<string> = this.router.events.pipe(
    // Ждем окончания навигации
    filter((event) => event instanceof NavigationEnd),
    // Начинаем поиск с текущего активированного роута
    map(() => this.activatedRoute),
    // Рекурсивно ищем последний активный дочерний роут
    map((route: any) => {
      while (route.firstChild) {
        route = route.firstChild;
      }
      return route;
    }),
    // Переключаемся на стрим данных этого роута
    mergeMap((route) => route.data),
    // Берем title или ставим дефолтное значение
    map((data: any) => data['title'] || ''),
    // Чтобы заголовок был сразу при загрузке
    startWith('')
  );

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme(this.isDarkMode);
  }

  private applyTheme(isDark: boolean) {
    this.isDarkMode = isDark;

    // Вешаем класс на <html> (это и есть :root)
    // Ionic 8 использует именно .ion-palette-dark
    const root = document.documentElement;
    root.classList.toggle('ion-palette-dark', isDark);

    // Дополнительно форсим color-scheme через инлайн-стиль для надежности
    root.style.setProperty('color-scheme', isDark ? 'dark' : 'light');

    localStorage.setItem('user-theme', isDark ? 'dark' : 'light');
  }

  ngOnInit() {
    // 1. Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('user-theme');

    // 2. Если сохранения нет, проверяем системную настройку Pixel 9
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    this.applyTheme(this.isDarkMode);
  }



  checkRole(routeRoles: string[], userRole: string | null): boolean {
    if (!routeRoles) return true;
    return userRole ? routeRoles.includes(userRole) : false;
  }

  // Селектор для отображения кнопки (можно вынести в auth.selectors.ts)
  public isAuthenticated$ = this.store.select(state => state.auth.isAuthenticated);

  constructor() {
    // Регистрируем иконку (обязательно для standalone)
    addIcons({ homeOutline, shieldCheckmarkOutline, logOutOutline, settingsOutline, cloudDone, cloudOffline, micOutline, moonOutline, sunnyOutline });
    // this.router.events.subscribe(event => {
    //   console.log('Router Event:', event);
    // });
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
