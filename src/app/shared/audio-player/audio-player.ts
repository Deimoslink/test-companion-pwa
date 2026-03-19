import {Component, computed, EventEmitter, Input, Output, signal} from '@angular/core';
import {OfflineEntry} from '@core/services/storage.service';
import {CommonModule, DatePipe, DecimalPipe} from '@angular/common';
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
import {
  IonButton,
  IonIcon,
  IonItem, IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel, IonNote,
  IonRange
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, IonItemSliding, IonItem, IonIcon, IonLabel, IonRange, IonItemOptions, IonItemOption, IonNote, IonButton],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.scss',
})
export class AudioPlayer {
  private _recording!: OfflineEntry;
  @Input({ required: true })
  set recording(value: OfflineEntry) {
    console.log('Setting recording:', value);
    this._recording = value;
    if (value.metadata?.duration) {
      this.duration.set(value.metadata.duration);
    }
    if (value.metadata?.waveform) {
      this.waveform.set(value.metadata.waveform);
    }
  }
  get recording(): OfflineEntry {
    return this._recording;
  }



  @Output() delete = new EventEmitter<number | undefined>(); // Добавь undefined сюда

  // Внутренний стейт плеера
  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  waveform = signal<number[]>([]); // Сигнал для волны
  progress = computed(() => {
    if (this.duration() === 0) return 0;
    return (this.currentTime() / this.duration()) * 100;
  });

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

  seekFromWaveform(ev: MouseEvent) {
    const container = ev.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = ev.clientX - rect.left; // Клик относительно контейнера
    const clickedPercent = x / rect.width;
    const newTime = clickedPercent * this.duration();

    this.audio.currentTime = newTime;
    this.currentTime.set(newTime);
  }
}
