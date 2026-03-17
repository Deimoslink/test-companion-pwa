export type UserRole = 'admin' | 'user' | 'guest';

export interface AuthState {
  role: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
