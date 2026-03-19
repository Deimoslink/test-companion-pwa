import {inject, Injectable} from '@angular/core';
import {delay, of, Observable, throwError, switchMap} from 'rxjs';
import {UserRole} from '@state/auth/auth.state';
import {AuthActions} from '@state/auth/auth.actions';
import {Store} from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private store = inject(Store);

  login(username: string, password: string) {
    this.store.dispatch(AuthActions.login({ username, password }));
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }

  loginApi(username: string, password: string): Observable<{ token: string; role: UserRole }> {
    if (password === 'password') {
      if (username === 'admin') {
        return of({ token: 'fake-admin-token', role: 'admin' as UserRole }).pipe(delay(1000));
      } else if (username === 'user') {
        return of({ token: 'fake-user-token', role: 'user' as UserRole }).pipe(delay(1000));
      }
    }

    return of(null).pipe(
      delay(1000),
      switchMap(() => throwError(() => new Error('Incorrect login or password')))
    );
  }

  getCurrentUser(): Observable<{ role: UserRole }> {
    const saved = localStorage.getItem('user_session');
    if (saved) {
      return of(JSON.parse(saved)).pipe(delay(500));
    }
    return throwError(() => new Error('No session'));
  }

}
