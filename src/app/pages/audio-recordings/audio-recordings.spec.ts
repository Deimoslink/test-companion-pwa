import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioRecordings } from './audio-recordings';

describe('AudioRecordings', () => {
  let component: AudioRecordings;
  let fixture: ComponentFixture<AudioRecordings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioRecordings],
    }).compileComponents();

    fixture = TestBed.createComponent(AudioRecordings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
