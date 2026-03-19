import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {UserRole} from './auth.state';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Init Auth': emptyProps(),
    'Init Auth Success': props<{ role: UserRole }>(),
    'Init Auth Failure': emptyProps(),
    'Login': props<{ username: string; password: string }>(),
    'Login Success': props<{ role: UserRole }>(),
    'Login Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
  }
});
