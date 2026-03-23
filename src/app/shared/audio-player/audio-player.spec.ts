import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioPlayer } from './audio-player';
import { AudioOfflineEntry } from '@core/services/storage.service';
import { ChangeDetectorRef } from '@angular/core';

describe('AudioPlayer', () => {
  let component: AudioPlayer;
  let fixture: ComponentFixture<AudioPlayer>;
  let mockAudio: any;

  // Mock data representing a recorded file
  const mockRecording: AudioOfflineEntry = {
    id: 1,
    type: 'audio',
    synced: 0,
    timestamp: Date.now(),
    blob: new Blob(['audio-data'], { type: 'audio/mp4' }),
    metadata: {
      duration: 100,
      waveform: new Array(100).fill(0.5),
      name: 'Test Record'
    }
  };

  beforeEach(async () => {
    // 1. Define the Mock Audio Object
    mockAudio = {
      play: jasmine.createSpy('play').and.returnValue(Promise.resolve()),
      pause: jasmine.createSpy('pause'),
      load: jasmine.createSpy('load'),
      src: '',
      paused: true,
      ended: false,
      currentTime: 0,
      duration: 100,
      // These will be assigned by the component constructor
      onplay: null,
      onpause: null,
      onended: null,
      onloadedmetadata: null,
      oncanplaythrough: null
    };

    // 2. Intercept the global Audio constructor BEFORE component creation
    spyOn(window, 'Audio').and.returnValue(mockAudio);

    // 3. Mock URL global methods to prevent real Blob URL creation
    spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
    spyOn(URL, 'revokeObjectURL');

    await TestBed.configureTestingModule({
      imports: [AudioPlayer],
      providers: [ChangeDetectorRef]
    }).compileComponents();

    fixture = TestBed.createComponent(AudioPlayer);
    component = fixture.componentInstance;

    // 4. Provide the required Input
    component.recording = mockRecording;

    fixture.detectChanges();
  });

  it('should create and initialize signals from input', () => {
    expect(component).toBeTruthy();
    expect(component.duration()).toBe(100);
    expect(component.waveform().length).toBe(100);
  });

  describe('playPause logic', () => {
    it('should initialize source and play if audio is stopped', async () => {
      const event = new Event('click');
      mockAudio.paused = true;
      mockAudio.src = '';

      await component.playPause(event);

      expect(URL.createObjectURL).toHaveBeenCalledWith(mockRecording.blob);
      expect(mockAudio.src).toBe('blob:mock-url');
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should pause if audio is currently playing', async () => {
      const event = new Event('click');
      mockAudio.paused = false;
      mockAudio.src = 'existing-src';

      await component.playPause(event);

      expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('should log error if play() fails', async () => {
      spyOn(console, 'error');
      mockAudio.play.and.returnValue(Promise.reject('Hardware Issue'));

      const event = new Event('click');
      await component.playPause(event);

      expect(console.error).toHaveBeenCalledWith('Playback error:', 'Hardware Issue');
    });
  });

  describe('Audio Events (Synchronized with Mock)', () => {
    it('should update isPlaying when onplay fires', () => {
      if (mockAudio.onplay) mockAudio.onplay();
      expect(component.isPlaying()).toBeTrue();
    });

    it('should update isPlaying when onpause fires', () => {
      component.isPlaying.set(true);
      if (mockAudio.onpause) mockAudio.onpause();
      expect(component.isPlaying()).toBeFalse();
    });

    it('should reset currentTime and isPlaying when onended fires', () => {
      component.isPlaying.set(true);
      component.currentTime.set(50);

      if (mockAudio.onended) mockAudio.onended();

      expect(component.isPlaying()).toBeFalse();
      expect(component.currentTime()).toBe(0);
    });

    it('should update duration when metadata is loaded', () => {
      mockAudio.duration = 120;
      if (mockAudio.onloadedmetadata) mockAudio.onloadedmetadata();
      expect(component.duration()).toBe(120);
    });
  });

  describe('Waveform Interaction', () => {
    it('should calculate new currentTime based on click position', () => {
      const mockEvent = {
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, width: 200 })
        },
        clientX: 100 // 50% of the width
      } as unknown as MouseEvent;

      component.seekFromWaveform(mockEvent);

      expect(mockAudio.currentTime).toBe(50); // 50% of 100s
      expect(component.currentTime()).toBe(50);
    });
  });

  describe('Helper Methods and Computeds', () => {
    it('should format seconds into MM:SS string', () => {
      expect(component.formatTime(0)).toBe('00:00');
      expect(component.formatTime(65)).toBe('01:05');
      expect(component.formatTime(600)).toBe('10:00');
    });

    it('should calculate progress percentage correctly', () => {
      component.duration.set(200);
      component.currentTime.set(50);
      expect(component.progress()).toBe(25);

      component.duration.set(0);
      expect(component.progress()).toBe(0);
    });
  });

  describe('Lifecycle and Cleanup', () => {
    it('should stop animation and pause audio on destroy', () => {
      const stopSpy = spyOn(component as any, 'stopSmoothProgress');

      component.ngOnDestroy();

      expect(stopSpy).toHaveBeenCalled();
      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.src).toBe('');
    });
  });
});
