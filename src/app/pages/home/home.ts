import { Component, inject } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSegmentButton,
  IonFab,
  IonIcon,
  IonChip,
  IonAvatar,
  IonCardSubtitle,
  IonCardTitle,
  IonCardHeader,
  IonCard,
  IonCardContent,
  IonBadge,
  IonLabel,
  IonListHeader,
  IonSegment,
  IonFabButton,
  IonAccordion,
  IonAccordionGroup
} from '@ionic/angular/standalone';
import { Store } from '@ngrx/store';
import { AuthActions } from '@state/auth/auth.actions';
import { LayoutActions } from '@state/layout/layout.actions';
import { UserRole } from '@state/auth/auth.state';
import {addIcons} from 'ionicons'; // Импортируем тип роли
import {personOutline, settingsOutline, addOutline, star} from 'ionicons/icons';
import {RouterLink} from '@angular/router';
import {UpperCasePipe} from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonList, IonItem, IonLabel, IonBadge, IonAvatar,
    IonChip, IonIcon, IonFab, IonFabButton, IonSegment, IonSegmentButton, IonListHeader, RouterLink, IonSegment, IonFabButton, IonAccordion, IonAccordionGroup, UpperCasePipe
  ]
})
export class Home {
  private readonly store = inject(Store);

  ionicColors = [
    'primary',
    'secondary',
    'tertiary',
    'success',
    'warning',
    'danger',
    'light',
    'medium',
    'dark'
  ];

  constructor() {
    addIcons({ personOutline, settingsOutline, addOutline, star });
  }

  ionViewWillEnter() {
    this.store.dispatch(LayoutActions.setTitle({ title: 'Home' }));
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
