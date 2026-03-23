import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { AuthService } from '@core/services/auth.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let storeSpy: jasmine.SpyObj<Store>;

  const mockLoadingSignal = signal(false);

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'selectSignal']);

    storeSpy.select.and.returnValue(of(null)); // for error$
    storeSpy.selectSignal.and.returnValue(mockLoadingSignal); // for isLoading

    await TestBed.configureTestingModule({
      imports: [Login, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Store, useValue: storeSpy },
        provideRouter([]) // Needed for RouterLink
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Validation Logic', () => {
    it('should return "Field is required" if touched and empty', () => {
      const mockControl = { touched: true, errors: { required: true } };
      const error = component.getPassError(mockControl);
      expect(error).toBe('Field is required');
    });

    it('should return length error if password is too short', () => {
      const mockControl = { touched: true, errors: { minlength: true } };
      const error = component.getPassError(mockControl);
      expect(error).toBe('Should be at least 6 characters');
    });

    it('should return empty string if field is valid or untouched', () => {
      const untouched = { touched: false, errors: { required: true } };
      const valid = { touched: true, errors: null };

      expect(component.getPassError(untouched)).toBe('');
      expect(component.getPassError(valid)).toBe('');
    });
  });

  describe('Login Action', () => {
    it('should call AuthService.login with credentials', () => {
      const user = 'test_user';
      const pass = 'password123';

      component.onLogin(user, pass);

      expect(authServiceSpy.login).toHaveBeenCalledWith(user, pass);
    });

    it('should reflect loading state from store', () => {
      mockLoadingSignal.set(true);
      fixture.detectChanges();

      expect(component.isLoading()).toBeTrue();
    });
  });
});
