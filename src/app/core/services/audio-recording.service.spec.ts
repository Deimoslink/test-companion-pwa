import { TestBed } from '@angular/core/testing';
import { AudioRecordingService } from './audio-recording.service';

describe('AudioRecordingService', () => {
  let service: AudioRecordingService;
  let mockStream: any;
  let mockMediaRecorder: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AudioRecordingService]
    });
    service = TestBed.inject(AudioRecordingService);

    // 1. Mock MediaStream and Tracks
    mockStream = {
      getTracks: jasmine.createSpy('getTracks').and.returnValue([
        { stop: jasmine.createSpy('stop') }
      ])
    };

    // 2. Mock MediaRecorder
    mockMediaRecorder = {
      start: jasmine.createSpy('start'),
      stop: jasmine.createSpy('stop'),
      ondataavailable: null,
      onstop: null
    };

    // 3. Mock navigator.mediaDevices.getUserMedia
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(mockStream));

    // 4. Mock global MediaRecorder constructor
    (window as any).MediaRecorder = jasmine.createSpy('MediaRecorder').and.returnValue(mockMediaRecorder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startRecording', () => {
    it('should initialize stream and start mediaRecorder', async () => {
      await service.startRecording();

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(window.MediaRecorder).toHaveBeenCalledWith(mockStream);
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    });

    it('should push data to chunks when dataavailable event fires', async () => {
      await service.startRecording();

      const mockBlob = new Blob(['test-data'], { type: 'audio/webm' });
      const event = { data: mockBlob } as any;

      // Manually trigger the callback
      if (mockMediaRecorder.ondataavailable) {
        mockMediaRecorder.ondataavailable(event);
      }

      // We access private property for coverage check (or use a public getter if you have one)
      expect((service as any).audioChunks.length).toBe(1);
      expect((service as any).audioChunks[0]).toBe(mockBlob);
    });

    it('should throw error if getUserMedia fails', async () => {
      (navigator.mediaDevices.getUserMedia as jasmine.Spy).and.returnValue(Promise.reject('Permission Denied'));

      await expectAsync(service.startRecording()).toBeRejectedWith('Permission Denied');
    });
  });

  describe('stopRecording', () => {
    it('should resolve with a Blob and cleanup resources', async () => {
      await service.startRecording();

      const stopPromise = service.stopRecording();

      // Simulate MediaRecorder stopping and firing the event
      if (mockMediaRecorder.onstop) {
        mockMediaRecorder.onstop();
      }

      const result = await stopPromise;

      expect(result).toBeInstanceOf(Blob);
      expect(mockMediaRecorder.stop).toHaveBeenCalled();
      expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
      expect((service as any).mediaRecorder).toBeNull();
    });

    it('should reject if stopRecording is called without starting', async () => {
      await expectAsync(service.stopRecording()).toBeRejectedWith('No recording in progress');
    });
  });
});
