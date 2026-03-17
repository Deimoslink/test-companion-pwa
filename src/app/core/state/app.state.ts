import { AuthState } from './auth/auth.state';
import { LayoutState } from './layout/layout.state';

export interface AppState {
  auth: AuthState;
  layout: LayoutState;
}
