import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { App } from './app';
import { ConnectionService } from '@core/services/connection.service';
import { AuthService } from '@core/services/auth.service';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  const connectionServiceMock = {
    isOnline: signal(true)
  };

  const authServiceMock = {
    logout: jasmine.createSpy('logout')
  };

  const initialState = {
    auth: {
      role: 'guest',
      isAuthenticated: false
    }
  };

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jasmine.createSpy().and.returnValue({
        matches: false,
        addEventListener: jasmine.createSpy(),
        removeEventListener: jasmine.createSpy(),
      }),
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideMockStore({ initialState }),
        provideRouter([]),
        { provide: ConnectionService, useValue: connectionServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
