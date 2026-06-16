import { Component, inject, OnInit, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { ApiService } from '@core/services/api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: true,
  imports: [
    IonContent, JsonPipe
  ]
})
export class Home {
  private apiService = inject(ApiService);

  error = signal<string | null>(null);

  todo = toSignal(
    this.apiService.getData().pipe(
      catchError((err) => {
        this.error.set('Ошибка загрузки данных');
        return of(null);
      })
    )
  );

}
