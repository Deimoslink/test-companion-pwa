import {Component} from '@angular/core';
import {IonContent} from '@ionic/angular/standalone';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
  standalone: true,
  imports: [IonContent]
})
export class Settings {}
