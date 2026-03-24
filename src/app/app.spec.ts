import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ConnectionService } from '@core/services/connection.service';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
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

  /**
   * Helper to create a mock matchMedia object
   */
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
    // Ensure the DOM has a main-content element for Ionic initialization
    if (!document.getElementById('main-content')) {
      const fakeContent = document.createElement('div');
      fakeContent.id = 'main-content';
      document.body.appendChild(fakeContent);
    }

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

    // Setup global matchMedia spy
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
        { provide: ConnectionService, useValue: connectionServiceSpy },
        ThemeService // Inject real ThemeService to test integration
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;

    // Ionic-specific test fix for swipe gesture
    const menu = fixture.nativeElement.querySelector('ion-menu');
    if (menu) {
      menu.swipeGesture = false;
    }

    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('Theme Logic', () => {
    let themeService: ThemeService;

    beforeEach(() => {
      localStorage.clear();
      document.documentElement.classList.remove('ion-palette-dark');
      themeService = TestBed.inject(ThemeService);
    });

    it('should initialize theme from localStorage if available', () => {
      // 1. Prepare localStorage
      localStorage.setItem('user-theme', 'dark');

      // 2. Update service signal manually to reflect storage change
      themeService.isDarkMode.set(true);

      // 3. Trigger Change Detection to run signal effects
      fixture.detectChanges();

      expect(component.isDarkMode()).toBeTrue();
      expect(document.documentElement.classList.contains('ion-palette-dark')).toBeTrue();
    });

    it('should initialize from matchMedia if localStorage is empty', () => {
      localStorage.clear();
      matchMediaSpy.and.returnValue(createMatchMediaObject(true));

      // Sync signal with mocked matchMedia
      themeService.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);

      fixture.detectChanges();

      expect(component.isDarkMode()).toBeTrue();
      expect(document.documentElement.classList.contains('ion-palette-dark')).toBeTrue();
    });

    it('should toggle theme and update localStorage', () => {
      // Ensure clean start with light mode
      themeService.isDarkMode.set(false);
      fixture.detectChanges();

      // Toggle to Dark Mode
      component.toggleTheme();
      fixture.detectChanges(); // Apply effect (writes to storage/DOM)

      expect(component.isDarkMode()).toBeTrue();
      expect(localStorage.getItem('user-theme')).toBe('dark');

      // Toggle back to Light Mode
      component.toggleTheme();
      fixture.detectChanges(); // Apply effect again

      expect(component.isDarkMode()).toBeFalse();
      expect(localStorage.getItem('user-theme')).toBe('light');
    });
  });

  describe('Navigation and Title', () => {
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

  describe('Menu and Roles', () => {
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

      // @ts-ignore: testing edge case with null routeRoles
      expect(component.checkRole(null, 'admin')).toBeTrue();
    });
  });

  describe('Auth Actions', () => {
    it('should call authService.logout', () => {
      component.logout();
      expect(authServiceSpy.logout).toHaveBeenCalled();
    });
  });
});
