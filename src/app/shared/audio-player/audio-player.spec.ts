import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioPlayer } from './audio-player';
import { AudioOfflineEntry } from '@core/services/storage.service';

describe('AudioPlayer', () => {
  let component: AudioPlayer;
  let fixture: ComponentFixture<AudioPlayer>;

  const mockRecording: AudioOfflineEntry = {
    timestamp: Date.now(),
    synced: 0,
    type: 'audio',
    blob: new Blob([''], { type: 'audio/mpeg' }),
    metadata: {
      name: 'test-audio.mp3',
      duration: 100,
      waveform: [0.1, 0.5, 0.2]
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioPlayer],
    }).compileComponents();

    fixture = TestBed.createComponent(AudioPlayer);
    component = fixture.componentInstance;

    component.recording = mockRecording;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
