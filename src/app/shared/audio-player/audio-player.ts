import {Component, computed, EventEmitter, Input, OnDestroy, Output, signal} from '@angular/core';
import {AudioOfflineEntry} from '@core/services/storage.service';
import {CommonModule, DecimalPipe} from '@angular/common';
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
  IonIcon,
  IonItem, IonItemOption,
  IonItemOptions,
  IonLabel
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule, DecimalPipe, IonItem, IonIcon, IonLabel, IonItemOptions, IonItemOption],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.scss',
})
export class AudioPlayer implements OnDestroy {
  private _recording!: AudioOfflineEntry;
  @Input({ required: true })
  set recording(value: AudioOfflineEntry) {
    this._recording = value;
    if (value.metadata?.duration) {
      this.duration.set(value.metadata.duration);
    }
    if (value.metadata?.waveform) {
      this.waveform.set(value.metadata.waveform);
    }
  }
  get recording(): AudioOfflineEntry {
    return this._recording;
  }
  @Output() delete = new EventEmitter<number | undefined>();

  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  waveform = signal<number[]>([]);
  progress = computed(() => {
    if (this.duration() === 0) return 0;
    return (this.currentTime() / this.duration()) * 100;
  });

  private audio = new Audio();

  private animationFrameId?: number;
  constructor() {
    this.audio.ontimeupdate = () => this.currentTime.set(this.audio.currentTime);
    this.audio.onloadedmetadata = () => this.duration.set(this.audio.duration);

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


    this.audio.onplay = () => {
      this.isPlaying.set(true);
      this.startSmoothProgress();
    };

    this.audio.onpause = () => {
      this.isPlaying.set(false);
      this.stopSmoothProgress();
    };

    this.audio.onended = () => {
      this.isPlaying.set(false);
      this.stopSmoothProgress();
      this.currentTime.set(0);
    };

  }

  async playPause(event: Event) {
    event.stopPropagation();

    if (!this.audio.src || this.audio.src === '') {
      const url = URL.createObjectURL(this.recording.blob);
      this.audio.src = url;
      this.audio.oncanplaythrough = () => URL.revokeObjectURL(url);
    }

    if (!this.audio.paused) {
      this.audio.pause();
    } else {
      try {
        await this.audio.play();
      } catch (err) {
        console.error('Playback error:', err);
      }
    }
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
    const x = ev.clientX - rect.left;
    const clickedPercent = x / rect.width;
    const newTime = clickedPercent * this.duration();

    this.audio.currentTime = newTime;
    this.currentTime.set(newTime);
  }

  private startSmoothProgress() {
    this.stopSmoothProgress();

    const update = () => {
      if (!this.audio.paused && !this.audio.ended) {
        this.currentTime.set(this.audio.currentTime);
        this.animationFrameId = requestAnimationFrame(update);
      }
    };
    this.animationFrameId = requestAnimationFrame(update);
  }

  private stopSmoothProgress() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  ngOnDestroy() {
    this.stopSmoothProgress();
    this.audio.pause();
    this.audio.src = '';
  }


}
