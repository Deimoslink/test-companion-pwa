import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      throw error;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject('No recording in progress');
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        this.stream?.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.mediaRecorder = null;

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

}
