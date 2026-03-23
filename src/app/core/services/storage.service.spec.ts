import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import * as idb from 'idb';

xdescribe('StorageService', () => {
  let service: StorageService;

  const mockDb = {
    add: jasmine.createSpy('add').and.returnValue(Promise.resolve(1)),
    getAllFromIndex: jasmine.createSpy('getAllFromIndex').and.returnValue(Promise.resolve([])),
    delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve())
  };

  beforeEach(async () => {

    try {
      spyOn(idb, 'openDB').and.returnValue(Promise.resolve(mockDb as any));
    } catch (e) {

      const idbPrototype = Object.getPrototypeOf(idb);
      if (idbPrototype) {
        idbPrototype.openDB = () => Promise.resolve(mockDb);
      }
    }

    TestBed.configureTestingModule({
      providers: [StorageService]
    });

    service = TestBed.inject(StorageService);
  });

  xit('should be created and open database', () => {
    expect(service).toBeTruthy();
    expect(idb.openDB).toHaveBeenCalled();
  });

  xdescribe('save', () => {
    it('should convert blob to arrayBuffer and add to store', async () => {
      const mockBlob = new Blob(['test-audio'], { type: 'audio/webm' });
      const mockMetadata = { duration: 10, waveform: [0.1, 0.5] };

      // Spy on Date.now to have predictable timestamp
      const mockTimestamp = 123456789;
      spyOn(Date, 'now').and.returnValue(mockTimestamp);

      await service.save('audio', mockBlob, mockMetadata);

      // Verify that add was called with the correct data structure
      expect(mockDb.add).toHaveBeenCalledWith('sync_queue', jasmine.objectContaining({
        type: 'audio',
        metadata: mockMetadata,
        timestamp: mockTimestamp,
        synced: 0,
        mimeType: 'audio/webm'
      }));

      // Verify blob conversion (check if it's an ArrayBuffer)
      const callArgs = mockDb.add.calls.mostRecent().args[1];
      expect(callArgs.blob instanceof ArrayBuffer).toBeTrue();
    });
  });

  xdescribe('getUnsynced', () => {
    it('should fetch items by index and map them to AudioOfflineEntry with Blobs', async () => {
      const mockArrayBuffer = new Uint8Array([1, 2, 3]).buffer;
      const mockResults = [
        { id: 1, type: 'audio', blob: mockArrayBuffer, synced: 0 }
      ];

      mockDb.getAllFromIndex.and.returnValue(Promise.resolve(mockResults));

      const entries = await service.getUnsynced();

      expect(mockDb.getAllFromIndex).toHaveBeenCalledWith('sync_queue', 'by-synced', 0);
      expect(entries.length).toBe(1);
      expect(entries[0].blob instanceof Blob).toBeTrue();
      // Your service hardcodes 'audio/mp4' in mapping, verifying that
      expect(entries[0].blob.type).toBe('audio/mp4');
    });
  });

  xdescribe('delete', () => {
    it('should call db.delete with provided id', async () => {
      const targetId = 123;
      await service.delete(targetId);
      expect(mockDb.delete).toHaveBeenCalledWith('sync_queue', targetId);
    });
  });
});
