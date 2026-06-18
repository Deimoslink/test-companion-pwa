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
export class Home implements OnInit {
  private apiService = inject(ApiService);

  // Теперь оба состояния — это управляемые сигналы
  todo = signal<any>(null);
  error = signal<string | null>(null);

  ngOnInit() {
    // 1. Делаем первичный запрос при инициализации страницы
    this.loadData();

    // 2. Слушаем Workbox. Когда он обновит кэш из сети — молча перетираем сигнал свежаком
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Workbox сообщил об обновлении кэша. Обновляем UI...');
          this.loadData();
        }
      });
    }
  }

  private loadData() {
    this.apiService.getData().pipe(
      catchError((err) => {
        // Если в кэше вообще ничего нет и сеть лежит — покажем ошибку
        if (!this.todo()) {
          this.error.set('Ошибка загрузки данных');
        }
        return of(null);
      })
    ).subscribe((data) => {
      if (data) {
        this.todo.set(data);
        this.error.set(null); // Сбрасываем ошибку, если данные пришли (хоть из кэша, хоть из сети)
      }
    });
  }
}
