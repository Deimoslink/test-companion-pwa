import {Component, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {OfflineEntry, StorageService} from '@core/services/storage.service';
import {AudioRecordingService} from '@core/services/audio-recording.service';
import {addIcons} from 'ionicons';
import {
  micOutline,
  stopOutline,
  playCircleOutline,
  trashOutline,
  cloudDone,
  cloudOffline,
  musicalNotesOutline
} from 'ionicons/icons';
import {AudioPlayer} from '@shared/audio-player/audio-player'; // Если используешь Ionic компоненты


@Component({
  selector: 'app-audio-recordings',
  standalone: true,
  imports: [CommonModule, IonicModule, AudioPlayer],
  templateUrl: './audio-recordings.html',
  styleUrl: './audio-recordings.scss',
})
export class AudioRecordings implements OnInit {
  recordings = signal<OfflineEntry[]>([]);
  isRecording = signal(false);
  activeId = signal<number | null>(null);

  constructor(
    private audioService: AudioRecordingService,
    private storageService: StorageService
  ) {
    addIcons({
      micOutline,
      stopOutline,
      playCircleOutline,
      trashOutline,
      cloudDone,
      cloudOffline,
      musicalNotesOutline
    });

  }

  async ngOnInit() {
    await this.loadRecordings();
  }

  async loadRecordings() {
    const data = await this.storageService.getUnsynced();
    this.recordings.set(data);
    console.log('Recordings updated in signal:', this.recordings().length);
  }

  async toggleRecording() {
    if (this.isRecording()) {
      try {
        const blob = await this.audioService.stopRecording();
        if (blob.size > 0) {
          await this.storageService.save('audio', blob, {
            name: `Record ${new Date().toLocaleTimeString()}`
          });
        }
        this.isRecording.set(false);
        await this.loadRecordings();
      } catch (err) {
        console.error('Error:', err);
        this.isRecording.set(false);
      }
    } else {
      try {
        await this.audioService.startRecording();
        this.isRecording.set(true);
      } catch (err) {
        console.error('Start failed:', err);
      }
    }
  }

  playRecording(blob: Blob) {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(audioUrl);
  }

  async deleteRecord(id: number | null | undefined) {
    // Проверяем на существование, чтобы отсечь undefined и null
    if (id === null || id === undefined) return;

    // Теперь TS уверен, что id — это number
    await this.storageService.delete(id);

    if (this.activeId() === id) {
      this.activeId.set(null);
    }
    await this.loadRecordings();
  }

}
