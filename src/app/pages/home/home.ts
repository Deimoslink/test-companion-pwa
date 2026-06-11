import {Component, OnInit, signal} from '@angular/core';
import {IonContent,} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: true,
  imports: [
    IonContent
  ]
})
export class Home implements OnInit {
  cacheStatus = signal<string>('Checking...');

  async ngOnInit() {
    const keys = await caches.keys();
    this.cacheStatus.set(keys.join(', '));
  }
}
