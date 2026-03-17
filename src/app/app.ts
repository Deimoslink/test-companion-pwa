import {Component, inject} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {
  IonApp, IonHeader, IonToolbar, IonTitle,
  IonContent, IonRouterOutlet, IonButtons,
  IonButton, IonIcon, IonMenu, IonList, IonItem, IonLabel, IonMenuButton, IonMenuToggle
} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {Store} from '@ngrx/store';
import {selectTitle} from '@state/layout/layout.selectors';
import {AuthActions} from '@state/auth/auth.actions';
import {AppState} from '@state/app.state';
import {startWith, tap} from 'rxjs/operators';
import {Router, RouterLink} from '@angular/router';
import {homeOutline, shieldCheckmarkOutline, logOutOutline, settingsOutline, cloudDone, cloudOffline} from 'ionicons/icons';
import {routes} from './app.routes';
import {ConnectionService} from '@core/services/connection.service';

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
export class App {
  public connectionService = inject(ConnectionService);
  public isOnline = this.connectionService.isOnline;

  private readonly store = inject(Store<AppState>);

  public menuItems = routes.filter(route => route.data?.['showInMenu']);

  public userRole$ = this.store.select(state => state.auth.role);

  public title$ = this.store.select(selectTitle).pipe(
    startWith(''),
    tap(value => console.log('DEBUG: Текущий тайтл в App:', value))
  );

  checkRole(routeRoles: string[], userRole: string | null): boolean {
    if (!routeRoles) return true;
    return userRole ? routeRoles.includes(userRole) : false;
  }

  // Селектор для отображения кнопки (можно вынести в auth.selectors.ts)
  public isAuthenticated$ = this.store.select(state => state.auth.isAuthenticated);

  constructor(private router: Router) {
    // Регистрируем иконку (обязательно для standalone)
    addIcons({ homeOutline, shieldCheckmarkOutline, logOutOutline, settingsOutline, cloudDone, cloudOffline });
    // this.router.events.subscribe(event => {
    //   console.log('Router Event:', event);
    // });
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
