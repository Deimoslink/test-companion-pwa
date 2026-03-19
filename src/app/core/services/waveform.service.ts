import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WaveformService {
  private audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  async generateWaveform(blob: Blob, points = 100): Promise<number[]> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    const rawData = audioBuffer.getChannelData(0); // Берем первый канал (моно)
    const samplesPerPoint = Math.floor(rawData.length / points);
    const peaks: number[] = [];

    for (let i = 0; i < points; i++) {
      let start = i * samplesPerPoint;
      let sum = 0;
      for (let j = 0; j < samplesPerPoint; j++) {
        sum += Math.abs(rawData[start + j]); // Считаем абсолютную громкость
      }
      peaks.push(sum / samplesPerPoint); // Средняя громкость за промежуток
    }

    // Нормализуем данные (чтобы самый громкий пик был равен 1)
    const maxPeak = Math.max(...peaks);
    return peaks.map(p => maxPeak === 0 ? 0 : p / maxPeak);
  }
}
