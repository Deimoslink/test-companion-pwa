import { TestBed } from '@angular/core/testing';
import { ConnectionService } from './connection.service';

describe('ConnectionService', () => {
  let service: ConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConnectionService]
    });
    service = TestBed.inject(ConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should reflect the initial browser online status', () => {
    // Initial value is taken from window.navigator.onLine
    const expectedStatus = window.navigator.onLine;
    expect(service.isOnline()).toBe(expectedStatus);
  });

  it('should update isOnline signal to true when window "online" event fires', () => {
    // Force set to false first to ensure change detection
    (service as any).isOnlineSignal.set(false);

    // Dispatch real DOM event
    window.dispatchEvent(new Event('online'));

    expect(service.isOnline()).toBeTrue();
  });

  it('should update isOnline signal to false when window "offline" event fires', () => {
    // Force set to true first
    (service as any).isOnlineSignal.set(true);

    // Dispatch real DOM event
    window.dispatchEvent(new Event('offline'));

    expect(service.isOnline()).toBeFalse();
  });
});
