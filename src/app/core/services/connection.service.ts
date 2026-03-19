import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private isOnlineSignal = signal<boolean>(window.navigator.onLine);

  readonly isOnline = this.isOnlineSignal.asReadonly();

  constructor() {
    window.addEventListener('online', () => this.updateStatus(true));
    window.addEventListener('offline', () => this.updateStatus(false));
  }

  private updateStatus(status: boolean) {
    this.isOnlineSignal.set(status);
  }
}
