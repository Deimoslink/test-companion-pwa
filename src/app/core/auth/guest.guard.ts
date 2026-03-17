import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectIsAuthenticated } from '@state/auth/auth.selectors';

export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map(isAuthenticated => {
      // Если залогинен — просто возвращаем false.
      // Роутер не пустит на страницу, но и никуда не перенаправит.
      if (isAuthenticated) {
        console.warn('GLaDOS: Куда это ты собрался? Ты уже в системе.');
        return false;
      }

      return true;
    })
  );
};
