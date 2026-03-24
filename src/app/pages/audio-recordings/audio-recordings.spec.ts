import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioRecordings } from './audio-recordings';
import { AudioRecordingService } from '@core/services/audio-recording.service';
import { StorageService } from '@core/services/storage.service';
import { WaveformService } from '@core/services/waveform.service';

describe('AudioRecordings', () => {
  let component: AudioRecordings;
  let fixture: ComponentFixture<AudioRecordings>;

  // Service Mocks
  let audioSpy: jasmine.SpyObj<AudioRecordingService>;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let waveformSpy: jasmine.SpyObj<WaveformService>;

  beforeEach(async () => {
    // 1. Initialize spies for all dependencies
    audioSpy = jasmine.createSpyObj('AudioRecordingService', ['startRecording', 'stopRecording']);
    storageSpy = jasmine.createSpyObj('StorageService', ['getUnsynced', 'save', 'delete']);
    waveformSpy = jasmine.createSpyObj('WaveformService', ['generateWaveform']);

    // 2. Default mock behavior for initialization
    storageSpy.getUnsynced.and.returnValue(Promise.resolve([]));

    // 3. Mock AudioContext for the private getBlobDuration method
    const mockAudioBuffer = { duration: 5 };
    const mockAudioContext = {
      decodeAudioData: (data: any, resolve: any) => resolve(mockAudioBuffer),
      close: () => Promise.resolve()
    };
    (window as any).AudioContext = jasmine.createSpy('AudioContext').and.returnValue(mockAudioContext);

    await TestBed.configureTestingModule({
      imports: [AudioRecordings],
      providers: [
        { provide: AudioRecordingService, useValue: audioSpy },
        { provide: StorageService, useValue: storageSpy },
        { provide: WaveformService, useValue: waveformSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AudioRecordings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load recordings on initialization', async () => {
    const mockData = [{ id: 1, timestamp: Date.now(), synced: 0, type: 'audio' }] as any;
    storageSpy.getUnsynced.and.returnValue(Promise.resolve(mockData));

    await component.ngOnInit();

    expect(storageSpy.getUnsynced).toHaveBeenCalled();
    expect(component.recordings()).toEqual(mockData);
  });

  describe('toggleRecording', () => {
    it('should start recording when isRecording is false', async () => {
      component.isRecording.set(false);
      audioSpy.startRecording.and.returnValue(Promise.resolve());

      await component.toggleRecording();

      expect(audioSpy.startRecording).toHaveBeenCalled();
      expect(component.isRecording()).toBeTrue();
    });

    it('should handle startRecording failure gracefully', async () => {
      audioSpy.startRecording.and.returnValue(Promise.reject('Mic access denied'));
      spyOn(console, 'error');

      await component.toggleRecording();

      expect(component.isRecording()).toBeFalse();
      expect(console.error).toHaveBeenCalledWith('Start failed:', 'Mic access denied');
    });

    it('should stop, generate waveform, save, and refresh list when recording is active', async () => {
      component.isRecording.set(true);
      const mockBlob = new Blob(['audio-data'], { type: 'audio/webm' });
      // Mock non-zero size to pass the check
      Object.defineProperty(mockBlob, 'size', { value: 1024 });

      audioSpy.stopRecording.and.returnValue(Promise.resolve(mockBlob));
      waveformSpy.generateWaveform.and.returnValue(Promise.resolve(new Array(280).fill(0.5)));
      storageSpy.save.and.returnValue(Promise.resolve(1));

      await component.toggleRecording();

      expect(audioSpy.stopRecording).toHaveBeenCalled();
      expect(waveformSpy.generateWaveform).toHaveBeenCalledWith(mockBlob, 280);
      expect(storageSpy.save).toHaveBeenCalled();
      expect(component.isRecording()).toBeFalse();
      expect(storageSpy.getUnsynced).toHaveBeenCalled(); // Verifies list refresh
    });

    it('should set isRecording to false if stopRecording fails', async () => {
      component.isRecording.set(true);
      audioSpy.stopRecording.and.returnValue(Promise.reject('Stop error'));

      await component.toggleRecording();

      expect(component.isRecording()).toBeFalse();
    });
  });

  describe('deleteRecord', () => {
    it('should call storage delete and refresh the recordings list', async () => {
      const targetId = 42;

      await component.deleteRecord(targetId);

      expect(storageSpy.delete as any).toHaveBeenCalledWith(targetId);
      expect(storageSpy.getUnsynced).toHaveBeenCalled();
    });

    it('should reset activeId to null if the deleted record was currently active', async () => {
      const activeId = 10;
      component.activeId.set(activeId);

      await component.deleteRecord(activeId);

      expect(component.activeId()).toBeNull();
    });

    it('should return immediately if id is null or undefined', async () => {
      await component.deleteRecord(null);
      await component.deleteRecord(undefined);

      expect(storageSpy.delete as any).not.toHaveBeenCalled();
    });
  });

  describe('getBlobDuration (Private Logic)', () => {
    it('should return 0 and log error if AudioContext fails', async () => {
      const mockBlob = new Blob();
      spyOn(console, 'error');
      // Mock failure by making AudioContext throw
      (window as any).AudioContext.and.callFake(() => { throw new Error('WebAudio Fail'); });

      // Accessing private method via bracket notation for testing
      const duration = await (component as any).getBlobDuration(mockBlob);

      expect(duration).toBe(0);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('toggleRecording - Additional Branches', () => {
    it('should not save or refresh if blob is null or size is 0', async () => {
      component.isRecording.set(true);
      // Imitate a blob with size 0 to trigger the edge case
      audioSpy.stopRecording.and.returnValue(Promise.resolve(new Blob([], { type: 'audio/webm' })));

      await component.toggleRecording();

      expect(storageSpy.save).not.toHaveBeenCalled();
      expect(component.isRecording()).toBeFalse();
    });

    it('should handle save error and still set isRecording to false', async () => {
      component.isRecording.set(true);
      const mockBlob = new Blob(['data'], { type: 'audio/webm' });
      Object.defineProperty(mockBlob, 'size', { value: 100 });

      audioSpy.stopRecording.and.returnValue(Promise.resolve(mockBlob));
      storageSpy.save.and.returnValue(Promise.reject('DB Error'));

      await component.toggleRecording();

      expect(component.isRecording()).toBeFalse();
      // Check that execution did not break fatally
    });
  });

  describe('getBlobDuration - Deep Dive', () => {
    it('should handle decodeAudioData rejection', async () => {
      const mockBlob = new Blob(['data']);
      spyOn(console, 'error');

      // Create a mock AudioContext that simulates decodeAudioData failure
      const mockAudioContext = {
        decodeAudioData: (data: any, resolve: any, reject: any) => reject('Decode Failed'),
        close: () => Promise.resolve()
      };
      (window as any).AudioContext.and.returnValue(mockAudioContext);

      const duration = await (component as any).getBlobDuration(mockBlob);

      expect(duration).toBe(0);
      expect(console.error).toHaveBeenCalledWith('WebAudio Duration Error:', 'Decode Failed');
    });

    it('should use webkitAudioContext if AudioContext is missing', async () => {
      const originalAudioContext = window.AudioContext;
      (window as any).AudioContext = undefined;
      (window as any).webkitAudioContext = jasmine.createSpy('webkitAudioContext').and.returnValue({
        decodeAudioData: (d: any, res: any) => res({ duration: 10 }),
        close: () => Promise.resolve()
      });

      const duration = await (component as any).getBlobDuration(new Blob(['data']));

      expect(duration).toBe(10);
      expect((window as any).webkitAudioContext).toHaveBeenCalled();

      window.AudioContext = originalAudioContext;
    });
  });


});
