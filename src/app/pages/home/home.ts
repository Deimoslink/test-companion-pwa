import {Component} from '@angular/core';
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
export class Home {}
