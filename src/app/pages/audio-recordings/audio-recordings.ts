import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
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
import {AudioPlayer} from '@shared/audio-player/audio-player';
import {
  IonCard,
  IonCardContent, IonContent,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonList, IonListHeader
} from '@ionic/angular/standalone';
import {WaveformService} from '@core/services/waveform.service';


@Component({
  selector: 'app-audio-recordings',
  standalone: true,
  imports: [CommonModule, AudioPlayer, IonFabButton, IonLabel, IonList, IonCard, IonCardContent, IonIcon, IonListHeader, IonContent],
  templateUrl: './audio-recordings.html',
  styleUrl: './audio-recordings.scss',
})
export class AudioRecordings implements OnInit {
  recordings = signal<OfflineEntry[]>([]);
  isRecording = signal(false);
  activeId = signal<number | null>(null);

  constructor(
    private audioService: AudioRecordingService,
    private storageService: StorageService,
    private waveformService: WaveformService
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
  }

  async toggleRecording() {
    if (this.isRecording()) {
      try {
        const blob = await this.audioService.stopRecording();
        if (blob.size > 0) {

          const [duration, waveform] = await Promise.all([
            this.getBlobDuration(blob),
            this.waveformService.generateWaveform(blob, 280) // Генерируем 140 точек
          ]);

          await this.storageService.save('audio', blob, {
            name: `Record ${new Date().toLocaleTimeString()}`,
            duration,
            waveform
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

  async deleteRecord(id: number | null | undefined) {
    if (id === null || id === undefined) return;

    await this.storageService.delete(id);

    if (this.activeId() === id) {
      this.activeId.set(null);
    }
    await this.loadRecordings();
  }

  private getBlobDuration(blob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const tempAudio = new Audio();
      const url = URL.createObjectURL(blob);

      tempAudio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        // If webm/ogg, duration  may be Infinity:
        if (tempAudio.duration === Infinity) {
          tempAudio.currentTime = 1e101;
          tempAudio.ontimeupdate = () => {
            tempAudio.ontimeupdate = null;
            resolve(tempAudio.duration);
            tempAudio.currentTime = 0;
          };
        } else {
          resolve(tempAudio.duration);
        }
      });

      tempAudio.src = url;
    });
  }

}
