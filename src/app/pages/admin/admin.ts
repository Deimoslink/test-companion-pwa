import { Component, inject, OnInit } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonText,
  IonHeader,
  IonToolbar,
  IonTitle, IonList, IonItem, IonLabel, IonToggle
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LayoutActions } from '@state/layout/layout.actions';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonText,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    RouterLink
  ]
})
export class Admin {
  private readonly store = inject(Store);

  ionViewWillEnter() {
    this.store.dispatch(LayoutActions.setTitle({ title: 'Admin' }));
  }

}
