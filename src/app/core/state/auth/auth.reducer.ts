import {createReducer, on} from '@ngrx/store';
import {AuthState} from './auth.state';
import {AuthActions} from './auth.actions';


// TODO: rewrite after real authentication implemented
const getInitialAuthState = (): AuthState => {
  const savedSession = localStorage.getItem('user_session');

  if (savedSession) {
    try {
      const parsed = JSON.parse(savedSession);
      return {
        isAuthenticated: true,
        role: parsed.role,
        loading: false,
        error: null
      };
    } catch (e) {
      console.error(e);
    }
  }

  return {
    isAuthenticated: false,
    role: 'guest',
    loading: false,
    error: null
  };
};

const logoutState: AuthState = {
  isAuthenticated: false,
  role: 'guest',
  loading: false,
  error: null
};

export const initialState: AuthState = getInitialAuthState();

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state) => ({
    ...state,
    loading: true
  })),

  on(AuthActions.loginSuccess, (state, { role }) => ({
    ...state,
    role,
    isAuthenticated: true,
    loading: false
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    role: 'guest',
    loading: false,
    error: error
  })),

  on(AuthActions.logout, () => logoutState)
);
