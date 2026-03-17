import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {map, take} from 'rxjs';
import {selectAuthRole, selectIsAuthenticated} from '@state/auth/auth.selectors';
import {UserRole} from '@state/auth/auth.state';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const store = inject(Store);
    const router = inject(Router);

    return store.select(selectIsAuthenticated).pipe(
      take(1),
      map(isAuthenticated => {
        console.log('DEBUG: Guard checking status. Authenticated:', isAuthenticated);
        if (!isAuthenticated) {
          // Если не залогинен — отправляем на логин
          return router.parseUrl('/login');
        }

        // Если залогинен, проверяем роль через второй селектор
        let hasRole = false;
        // Мы используем take(1), так как нам нужно мгновенное значение
        store.select(selectAuthRole).pipe(take(1)).subscribe(role => {
          hasRole = allowedRoles.includes(role);
        });

        if (hasRole) {
          return true;
        }

        // Если роль не подходит — на home
        return router.parseUrl('/home');
      })
    );
  };
};
