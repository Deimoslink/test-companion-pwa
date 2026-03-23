import { TestBed } from '@angular/core/testing';
import { WaveformService } from './waveform.service';

describe('WaveformService', () => {
  let service: WaveformService;
  let mockAudioContext: any;
  let mockAudioBuffer: any;

  beforeEach(() => {
    const mockChannelData = new Float32Array(1000).fill(0.5);

    mockAudioBuffer = {
      getChannelData: jasmine.createSpy('getChannelData').and.returnValue(mockChannelData),
      length: 1000
    };

    mockAudioContext = {
      decodeAudioData: jasmine.createSpy('decodeAudioData').and.returnValue(Promise.resolve(mockAudioBuffer))
    };

    (window as any).AudioContext = jasmine.createSpy('AudioContext').and.returnValue(mockAudioContext);

    TestBed.configureTestingModule({
      providers: [WaveformService]
    });
    service = TestBed.inject(WaveformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a normalized waveform array', async () => {
    const mockBlob = new Blob(['dummy-audio-data'], { type: 'audio/wav' });
    const points = 10;

    const result = await service.generateWaveform(mockBlob, points);

    expect(mockAudioContext.decodeAudioData).toHaveBeenCalled();
    expect(mockAudioBuffer.getChannelData).toHaveBeenCalledWith(0);

    expect(result.length).toBe(points);
    expect(result[0]).toBeCloseTo(1, 1);
  });

  it('should handle zero-filled audio data without division by zero', async () => {
    const silentData = new Float32Array(100).fill(0);
    mockAudioBuffer.getChannelData.and.returnValue(silentData);
    mockAudioBuffer.length = 100;

    const mockBlob = new Blob(['silent-data'], { type: 'audio/wav' });
    const result = await service.generateWaveform(mockBlob, 10);

    expect(result.every(p => p === 0)).toBeTrue();
  });
});
