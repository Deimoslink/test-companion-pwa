import { Component, OnInit, signal } from '@angular/core';
import { IonContent, IonSpinner, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
  standalone: true,
  imports: [IonContent, IonContent, IonSpinner, IonCard, IonCardContent]
})
export class Admin implements OnInit {
  // Сигналы для реактивного управления стейтом
  images = signal<string[]>([]);
  isLoading = signal<boolean>(true);

  private apiContractUrl = 'https://dog.ceo/api/breeds/image/random/3';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    this.isLoading.set(true);

    this.http.get<{ message: string[], status: string }>(this.apiContractUrl)
      .subscribe({
        next: (response) => {
          if (response && response.status === 'success') {
            this.images.set(response.message);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Ошибка получения картинок:', err);
          this.isLoading.set(false);
        }
      });
  }
}
