import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AuthActions } from '@state/auth/auth.actions';
import { UserRole } from '@state/auth/auth.state';

describe('AuthService', () => {
  let service: AuthService;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideMockStore()
      ]
    });

    service = TestBed.inject(AuthService);
    store = TestBed.inject(MockStore);

    localStorage.clear();
    spyOn(store, 'dispatch');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Store Actions', () => {
    it('should dispatch login action', () => {
      service.login('testUser', 'testPass');
      expect(store.dispatch).toHaveBeenCalledWith(
        AuthActions.login({ username: 'testUser', password: 'testPass' })
      );
    });

    it('should dispatch logout action', () => {
      service.logout();
      expect(store.dispatch).toHaveBeenCalledWith(AuthActions.logout());
    });
  });

  describe('loginApi', () => {
    it('should return admin token and role for admin credentials', fakeAsync(() => {
      let result: any;
      service.loginApi('admin', 'password').subscribe(res => result = res);

      tick(1000); // Fast-forward 1 second
      expect(result).toEqual({ token: 'fake-admin-token', role: 'admin' as UserRole });
    }));

    it('should return user token and role for user credentials', fakeAsync(() => {
      let result: any;
      service.loginApi('user', 'password').subscribe(res => result = res);

      tick(1000);
      expect(result).toEqual({ token: 'fake-user-token', role: 'user' as UserRole });
    }));

    it('should throw error for incorrect credentials', fakeAsync(() => {
      let errorResponse: any;
      service.loginApi('wrong', 'wrong').subscribe({
        error: (err) => errorResponse = err
      });

      tick(1000);
      expect(errorResponse.message).toBe('Incorrect login or password');
    }));
  });

  describe('getCurrentUser', () => {
    it('should return user from localStorage if session exists', fakeAsync(() => {
      const mockSession = { role: 'admin' as UserRole };
      localStorage.setItem('user_session', JSON.stringify(mockSession));

      let result: any;
      service.getCurrentUser().subscribe(res => result = res);

      tick(500); // Service has delay(500)
      expect(result).toEqual(mockSession);
    }));

    it('should throw error if no session in localStorage', fakeAsync(() => {
      let errorResponse: any;
      service.getCurrentUser().subscribe({
        error: (err) => errorResponse = err
      });

      // No tick needed for immediate throw, but your code uses of().pipe(delay)
      // Wait, in your code 'No session' branch is NOT delayed. It throws immediately.
      expect(errorResponse.message).toBe('No session');
    }));
  });
});
