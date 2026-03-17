import { Component, inject, OnInit } from '@angular/core';
import { IonContent, IonButton, IonList, IonItem, IonLabel, IonToggle } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LayoutActions } from '@state/layout/layout.actions';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonList, IonItem, IonLabel, IonToggle, RouterLink]
})
export class Settings {
  private readonly store = inject(Store);

  ionViewWillEnter() {
    this.store.dispatch(LayoutActions.setTitle({ title: 'Settings' }));
  }

}
