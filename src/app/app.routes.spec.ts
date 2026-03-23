import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { routes } from './app.routes';


describe('App Routes', () => {
  let router: Router;
  let harness: RouterTestingHarness;
  let store: MockStore;

  // Default state: Unauthorized user
  const initialState = {
    auth: {
      role: 'guest',
      isAuthenticated: false
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideMockStore({ initialState }),
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    store = TestBed.inject(MockStore);
    harness = await RouterTestingHarness.create();
  });

  it('should redirect guest to /login when accessing root', async () => {
    // Navigate to root which redirects to /home
    await harness.navigateByUrl('/');

    // roleGuard blocks /home for guests, so we expect /login
    expect(router.url).toBe('/login');
  });

  it('should redirect guest to /login for unknown paths', async () => {
    await harness.navigateByUrl('/some-random-page');

    // ** path redirects to /home -> roleGuard redirects to /login
    expect(router.url).toBe('/login');
  });

  it('should allow "admin" to access /home', async () => {
    // 1. Update store to Authorized state
    store.setState({
      auth: {
        role: 'admin',
        isAuthenticated: true
      }
    });

    // 2. Now navigation should succeed
    await harness.navigateByUrl('/home');
    expect(router.url).toBe('/home');
  });

  describe('Route Metadata', () => {
    it('should have correct title and icons in data object', () => {
      const adminRoute = routes.find(r => r.path === 'admin');

      expect(adminRoute?.data?.['title']).toBe('Admin');
      expect(adminRoute?.data?.['icon']).toBe('shield-checkmark-outline');
    });

    it('should be configured to show in menu where applicable', () => {
      const settingsRoute = routes.find(r => r.path === 'settings');
      expect(settingsRoute?.data?.['showInMenu']).toBeTrue();
    });
  });

  it('should redirect authorized "user" from /admin to /home', async () => {
    // Set role to 'user' (admin path is restricted to 'admin' only)
    store.setState({
      auth: {
        role: 'user',
        isAuthenticated: true
      }
    });

    await harness.navigateByUrl('/admin');

    // roleGuard should block 'user' from '/admin' and redirect elsewhere
    // usually to /home or /login depending on your Guard implementation
    expect(router.url).not.toBe('/admin');
  });

  it('should cover all lazy-loaded components by navigating with appropriate roles', async () => {
    // 1. Cover guest routes
    store.setState({ auth: { role: 'guest', isAuthenticated: false } });
    await harness.navigateByUrl('/password-restore');
    expect(router.url).toBe('/password-restore');

    // 2. Cover admin-only routes
    store.setState({ auth: { role: 'admin', isAuthenticated: true } });
    await harness.navigateByUrl('/admin');
    expect(router.url).toBe('/admin');

    // 3. Cover shared protected routes
    await harness.navigateByUrl('/settings');
    expect(router.url).toBe('/settings');

    await harness.navigateByUrl('/audio-recording');
    expect(router.url).toBe('/audio-recording');
  });

});
