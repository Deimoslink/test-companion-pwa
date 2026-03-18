import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {OfflineEntry} from '@core/services/storage.service';
import {CommonModule, DatePipe, DecimalPipe} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {
  micOutline,
  stopOutline,
  playCircleOutline,
  trashOutline,
  cloudDone,
  cloudOffline,
  musicalNotesOutline,
  pauseCircleOutline
} from 'ionicons/icons';
import {addIcons} from 'ionicons';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule, IonicModule, DecimalPipe, DatePipe],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.scss',
})
export class AudioPlayer {
  @Input({ required: true }) recording!: OfflineEntry;
  @Input() isExpanded = false;
  @Output() delete = new EventEmitter<number | undefined>(); // Добавь undefined сюда
  @Output() toggleExpand = new EventEmitter<void>();

  // Внутренний стейт плеера
  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);

  private audio = new Audio();

  constructor() {
    this.audio.ontimeupdate = () => this.currentTime.set(this.audio.currentTime);
    this.audio.onloadedmetadata = () => this.duration.set(this.audio.duration);
    this.audio.onended = () => this.isPlaying.set(false);

    addIcons({
      micOutline,
      stopOutline,
      playCircleOutline,
      trashOutline,
      cloudDone,
      cloudOffline,
      musicalNotesOutline,
      pauseCircleOutline
    });
  }

  async playPause(event: Event) {
    event.stopPropagation();

    if (!this.audio.src || this.audio.src === '') {
      const url = URL.createObjectURL(this.recording.blob);
      this.audio.src = url;
      this.audio.oncanplaythrough = () => URL.revokeObjectURL(url);
    }

    if (this.isPlaying()) {
      this.audio.pause();
      this.isPlaying.set(false);
    } else {
      try {
        // play() возвращает Promise. Мы ДОЛЖНЫ его дождаться или поймать ошибку.
        await this.audio.play();
        this.isPlaying.set(true);
      } catch (err) {
        // Здесь мы ловим тот самый AbortError.
        // Просто игнорируем его, так как это штатная отмена воспроизведения.
        if (err instanceof DOMException && err.name === 'AbortError') {
          console.warn('Playback interrupted by pause() or source change');
        } else {
          console.error('Playback error:', err);
        }
      }
    }
  }

  seek(ev: any) {
    this.audio.currentTime = ev.detail.value;
  }

  formatTime(seconds: number): string {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
