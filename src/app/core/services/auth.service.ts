import { Injectable } from '@angular/core';
import {delay, of, Observable, throwError, switchMap} from 'rxjs';
import { UserRole } from '@state/auth/auth.state';

@Injectable({ providedIn: 'root' })
export class AuthService {

  login(username: string, password: string): Observable<{ token: string; role: UserRole }> {
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

  logout(): Observable<boolean> {
    return of(true).pipe(delay(500));
  }
}
