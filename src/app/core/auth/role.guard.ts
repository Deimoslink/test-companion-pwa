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
        if (!isAuthenticated) {
          return router.parseUrl('/login');
        }

        let hasRole = false;
        store.select(selectAuthRole).pipe(take(1)).subscribe(role => {
          hasRole = allowedRoles.includes(role);
        });

        if (hasRole) {
          return true;
        }

        return router.parseUrl('/home');
      })
    );
  };
};
