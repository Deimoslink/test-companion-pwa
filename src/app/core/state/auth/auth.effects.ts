import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType, ROOT_EFFECTS_INIT} from '@ngrx/effects';
import {AuthService} from '@core/services/auth.service';
import {AuthActions} from './auth.actions';
import {map, exhaustMap, tap, catchError} from 'rxjs/operators';
import {Router} from '@angular/router';
import {delay, Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect((): Observable<Action> =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ username, password }) =>
        this.authService.loginApi(username, password).pipe(
          map((response) => AuthActions.loginSuccess({ role: response.role })),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message || 'Incorrect credentials' }))
          )
        )
      )
    )
  );

  initAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT), // NxRx starts with this action
      exhaustMap(() =>
        this.authService.getCurrentUser().pipe(
          map(user => AuthActions.initAuthSuccess({ role: user.role })),
          catchError(() => of(AuthActions.initAuthFailure()))
        )
      )
    )
  );

  // Redirect on successful login
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

  // Effect on logout - clear session and redirect
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      delay(500),
      tap(() => {
        localStorage.removeItem('user_session');
      }),
      tap(() => {
        // Clear any other session-related data here if needed
        this.router.navigate(['/login']);
      }),
    ),
    { dispatch: false }
  );
}
