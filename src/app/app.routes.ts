import {Routes} from '@angular/router';
import {roleGuard} from '@core/auth/role.guard';
import {guestGuard} from '@core/auth/guest.guard';
import {PasswordRestore} from '@pages/password-restore/password-restore';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Теперь стартуем с логина
  {
    path: 'login',
    loadComponent: () => import('@pages/login/login').then(m => m.Login),
    canActivate: [guestGuard]
  },
  {
    path: 'password-restore',
    loadComponent: () => import('@pages/password-restore/password-restore').then(m => m.PasswordRestore),
    canActivate: [guestGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('@pages/home/home').then(m => m.Home),
    canActivate: [roleGuard(['admin', 'user'])],
    data: { title: 'Home', icon: 'home-outline', roles: ['admin', 'user'], showInMenu: true }
  },
  {
    path: 'admin',
    loadComponent: () => import('@pages/admin/admin').then(m => m.Admin),
    canActivate: [roleGuard(['admin'])],
    data: { title: 'Admin', icon: 'shield-checkmark-outline', roles: ['admin'], showInMenu: true }
  },
  {
    path: 'settings',
    loadComponent: () => import('@pages/settings/settings').then(m => m.Settings),
    canActivate: [roleGuard(['admin', 'user'])],
    data: { title: 'Settings', icon: 'settings-outline', roles: ['admin', 'user'], showInMenu: true }
  }
];
