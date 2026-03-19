import {Component} from '@angular/core';
import {IonContent} from '@ionic/angular/standalone';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
  standalone: true,
  imports: [IonContent]
})
export class Admin {}
