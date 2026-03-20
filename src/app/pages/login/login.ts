import {Component, inject} from '@angular/core';
import {
  IonButton, IonCol,
  IonContent, IonGrid,
  IonInput,
  IonItem, IonList, IonRow, IonSpinner, IonText,
} from '@ionic/angular/standalone';

import {RouterLink} from '@angular/router';
import {Store} from '@ngrx/store';
import {selectAuthError, selectAuthLoading} from '@state/auth/auth.selectors';
import {FormsModule} from '@angular/forms';
import {AsyncPipe} from '@angular/common';
import {AuthService} from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    IonContent,
    IonButton, IonItem, IonInput, IonList, IonText,
    RouterLink, IonSpinner, FormsModule, AsyncPipe, IonCol, IonRow, IonGrid
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private store = inject(Store);

  public loginData = {
    username: '',
    password: ''
  };

  constructor(private authService: AuthService) {}

  getPassError(pass: any) {
    if (pass.touched && pass.errors) {
      if (pass.errors['required']) return 'Field is required';
      if (pass.errors['minlength']) return 'Should be at least 6 characters';
    }
    return '';
  }

  public isLoading = this.store.selectSignal(selectAuthLoading);
  public error$ = this.store.select(selectAuthError);

  onLogin(username: any, password: any) {
    this.authService.login(String(username), String(password));
  }

}
