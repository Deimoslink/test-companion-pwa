import {Component, inject, signal} from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader, IonInput,
  IonItem, IonList, IonSpinner, IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import {RouterLink} from '@angular/router';
import {Store} from '@ngrx/store';
import {UserRole} from '@state/auth/auth.state';
import {AuthActions} from '@state/auth/auth.actions';
import {selectAuthError, selectAuthLoading} from '@state/auth/auth.selectors';
import {FormsModule} from '@angular/forms';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButton, IonItem, IonInput, IonList, IonText,
    RouterLink, IonSpinner, FormsModule, AsyncPipe
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

  // Вспомогательный метод для сложной валидации пароля
  getPassError(pass: any) {
    if (pass.touched && pass.errors) {
      if (pass.errors['required']) return 'Field is required';
      if (pass.errors['minlength']) return 'Should be at least 6 characters';
    }
    return '';
  }

  // Локальный сигнал для анимации загрузки на кнопке
  public isLoading = this.store.selectSignal(selectAuthLoading);
  public error$ = this.store.select(selectAuthError);

  onLogin(username: any, password: any) {
    this.store.dispatch(AuthActions.login({
      username: String(username),
      password: String(password)
    }));
  }

}
