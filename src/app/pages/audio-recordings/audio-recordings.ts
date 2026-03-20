import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AudioOfflineEntry, StorageService} from '@core/services/storage.service';
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
  recordings = signal<AudioOfflineEntry[]>([]);
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
        if (blob && blob.size > 0) {
          const duration = await this.getBlobDuration(blob).catch(() => 0);
          const waveform = await this.waveformService.generateWaveform(blob, 280).catch(() => []);

          await this.storageService.save('audio', blob, {
            name: `Record ${new Date().toLocaleTimeString()}`,
            duration,
            waveform
          });
        }
        this.isRecording.set(false);
        await this.loadRecordings();
      } catch (err) {
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

  private async getBlobDuration(blob: Blob): Promise<number> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, resolve, reject);
      });

      await audioContext.close();

      return audioBuffer.duration;
    } catch (err) {
      console.error('WebAudio Duration Error:', err);
      return 0;
    }
  }

}
