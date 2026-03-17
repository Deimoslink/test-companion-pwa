import {createFeatureSelector, createSelector} from '@ngrx/store';
import {AuthState} from './auth.state';


export const selectAuthState = createFeatureSelector<AuthState>('auth');

// 2. Селектор для проверки авторизации (для хедера и гардов)
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

// 3. Селектор для роли (для Role Guard)
export const selectAuthRole = createSelector(
  selectAuthState,
  (state) => state.role
);

// 4. Тот самый селектор загрузки для кнопки логина
export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);
