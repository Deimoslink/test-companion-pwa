import { inject, Injectable } from '@angular/core';
import {Actions, createEffect, ofType, ROOT_EFFECTS_INIT} from '@ngrx/effects';
import { AuthService } from '@core/services/auth.service';
import { AuthActions } from './auth.actions';
import {map, exhaustMap, tap, catchError} from 'rxjs/operators';
import { Router } from '@angular/router';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect((): Observable<Action> =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ username, password }) => // Теперь тут будут username и password
        this.authService.login(username, password).pipe(
          map((response) => AuthActions.loginSuccess({ role: response.role })),
          catchError((error: any) =>
            of(AuthActions.loginFailure({ error: error.message || 'Incorrect credentials' }))
          )
        )
      )
    )
  );

  initAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT), // Специальный экшен NgRx, срабатывающий при старте
      exhaustMap(() =>
        this.authService.getCurrentUser().pipe( // Твой аналог fetchCurrentPrincipal
          map(user => AuthActions.initAuthSuccess({ role: user.role })),
          catchError(() => of(AuthActions.initAuthFailure()))
        )
      )
    )
  );

  // Редирект после успешного входа
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ role }) => {
        localStorage.setItem('user_session', JSON.stringify({ role }));
      }),
      tap(() => this.router.navigate(['/home'])),
    ),
    { dispatch: false }
  );

  // Эффект для выхода
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem('user_session');
      }),
      tap(() => {
        // Очищаем кэш/токены
        this.router.navigate(['/login']);
      }),
    ),
    { dispatch: false }
  );
}
