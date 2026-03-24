import {Component, inject, OnInit, signal} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {
  IonApp, IonHeader, IonToolbar, IonTitle,
  IonContent, IonRouterOutlet, IonButtons,
  IonButton, IonIcon, IonMenu, IonList, IonItem, IonLabel, IonMenuButton, IonMenuToggle,
  IonSplitPane
} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {Store} from '@ngrx/store';
import {AppState} from '@state/app.state';
import {filter, mergeMap, startWith} from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import {
  homeOutline,
  shieldCheckmarkOutline,
  logOutOutline,
  settingsOutline,
  cloudDone,
  cloudOffline,
  micOutline,
  moonOutline,
  sunnyOutline,
  chevronForwardOutline,
  menuOutline
} from 'ionicons/icons';
import {CustomRouteData, routes} from './app.routes';
import {ConnectionService} from '@core/services/connection.service';
import {map, Observable} from 'rxjs';
import {AuthService} from '@core/services/auth.service';
import {ThemeService} from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: ['app.scss'],
  standalone: true,
  imports: [
    IonApp, IonHeader, IonToolbar, IonTitle,
    IonContent, IonRouterOutlet, IonButtons,
    IonButton, IonIcon, AsyncPipe, IonMenu, IonList, IonItem, IonLabel, RouterLink, IonMenuButton, IonMenuToggle, IonSplitPane, RouterLinkActive
  ],
})
export class App {
  public connectionService = inject(ConnectionService);
  public themeService = inject(ThemeService);
  public isOnline = this.connectionService.isOnline;
  public isDarkMode = this.themeService.isDarkMode;

  public isMenuCollapsed = signal(false);

  public toggleMenu() {
    this.isMenuCollapsed.update(val => !val);
  }

  private readonly store = inject(Store<AppState>);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  public menuItems = routes.filter((route) => (route.data as CustomRouteData)?.showInMenu);

  public userRole$ = this.store.select(state => state.auth.role);
  public isAuthenticated$ = this.store.select(state => state.auth.isAuthenticated);

  public title$: Observable<string> = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => this.activatedRoute),
    map((route: ActivatedRoute) => {
      while (route.firstChild) {
        route = route.firstChild;
      }
      return route;
    }),
    mergeMap((route) => route.data as Observable<CustomRouteData>),
    map((data: CustomRouteData) => data.title || ''),
    startWith('')
  );

  constructor(private authService: AuthService) {
    addIcons({
      homeOutline,
      shieldCheckmarkOutline,
      logOutOutline,
      settingsOutline,
      cloudDone,
      cloudOffline,
      micOutline,
      moonOutline,
      sunnyOutline,
      chevronForwardOutline,
      menuOutline
    });
  }

  public toggleTheme() {
    this.themeService.toggleTheme();
  }

  public checkRole(routeRoles: string[], userRole: string | null): boolean {
    if (!routeRoles) return true;
    return userRole ? routeRoles.includes(userRole) : false;
  }

  public logout() {
    this.authService.logout();
  }
}
