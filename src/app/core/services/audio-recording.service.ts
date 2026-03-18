import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    console.log('Attempting to start recording');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        console.log('Data available, size:', event.data.size);
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      console.log('starting media recorder, current state:', this.mediaRecorder.state);
      this.mediaRecorder.start();
    } catch (error) {
      console.error('Microphone access denied', error);
      throw error;
    }
  }

  stopRecording(): Promise<Blob> {
    console.log('Attempting to stop recording, current state:', this.mediaRecorder?.state);
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject('No recording in progress');
      }

      this.mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped, chunks count:', this.audioChunks.length); // И ЭТО
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        console.log('Final Blob size:', audioBlob.size);

        // Останавливаем все треки микрофона, чтобы иконка записи в системе пропала
        this.stream?.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.mediaRecorder = null;

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
