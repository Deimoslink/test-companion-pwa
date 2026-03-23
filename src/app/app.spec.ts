import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ConnectionService } from '@core/services/connection.service';
import { AuthService } from '@core/services/auth.service';
import { of, Subject } from 'rxjs';
import { signal } from '@angular/core';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  let routerEventsSubject: Subject<any>;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let storeSpy: jasmine.SpyObj<Store>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let connectionServiceSpy: jasmine.SpyObj<ConnectionService>;
  let matchMediaSpy: jasmine.Spy;

  const createMatchMediaObject = (matches: boolean) => ({
    matches,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    mockRouter = {
      events: routerEventsSubject.asObservable(),
      navigate: jasmine.createSpy('navigate')
    };

    mockActivatedRoute = {
      firstChild: null,
      data: of({ title: 'Test Title' })
    };

    storeSpy = jasmine.createSpyObj('Store', ['select']);
    storeSpy.select.and.returnValue(of(true));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);

    connectionServiceSpy = jasmine.createSpyObj('ConnectionService', [], {
      isOnline: signal(true)
    });

    matchMediaSpy = jasmine.createSpy('matchMedia').and.callFake(() => createMatchMediaObject(false));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaSpy
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Store, useValue: storeSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ConnectionService, useValue: connectionServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;

    const menu = fixture.nativeElement.querySelector('ion-menu');
    if (menu) {
      menu.swipeGesture = false;
    }

    await fixture.whenStable()
    fixture.detectChanges();
  });

  xit('should create the app', () => {
    expect(component).toBeTruthy();
  });

  xdescribe('Theme Logic', () => {
    beforeEach(() => {
      localStorage.clear();
      document.documentElement.classList.remove('ion-palette-dark');
    });

    it('should initialize theme from localStorage if available', () => {
      localStorage.setItem('user-theme', 'dark');
      component.ngOnInit();
      expect(component.isDarkMode).toBeTrue();
      expect(document.documentElement.classList.contains('ion-palette-dark')).toBeTrue();
    });

    it('should initialize from matchMedia if localStorage is empty', () => {
      matchMediaSpy.and.returnValue(createMatchMediaObject(true));

      component.ngOnInit();
      expect(component.isDarkMode).toBeTrue();
      expect(document.documentElement.classList.contains('ion-palette-dark')).toBeTrue();
    });

    it('should toggle theme and update localStorage', () => {
      component.isDarkMode = false;
      component.toggleTheme();
      expect(component.isDarkMode).toBeTrue();
      expect(localStorage.getItem('user-theme')).toBe('dark');

      component.toggleTheme();
      expect(component.isDarkMode).toBeFalse();
      expect(localStorage.getItem('user-theme')).toBe('light');
    });
  });

  xdescribe('Navigation and Title', () => {
    it('should update title$ when NavigationEnd occurs', (done) => {
      component.title$.subscribe(title => {
        if (title === 'Test Title') {
          expect(title).toBe('Test Title');
          done();
        }
      });

      routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
    });
  });

  xdescribe('Menu and Roles', () => {
    it('should toggle isMenuCollapsed signal', () => {
      expect(component.isMenuCollapsed()).toBeFalse();
      component.toggleMenu();
      expect(component.isMenuCollapsed()).toBeTrue();
    });

    it('should correctly check roles', () => {
      const roles = ['admin', 'manager'];
      expect(component.checkRole(roles, 'admin')).toBeTrue();
      expect(component.checkRole(roles, 'user')).toBeFalse();
      expect(component.checkRole(roles, null)).toBeFalse();
      // @ts-ignore
      expect(component.checkRole(null, 'admin')).toBeTrue();
    });
  });

  xdescribe('Auth Actions', () => {
    it('should call authService.logout', () => {
      component.logout();
      expect(authServiceSpy.logout).toHaveBeenCalled();
    });
  });
});
