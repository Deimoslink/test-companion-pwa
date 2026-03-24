import { TestBed } from '@angular/core/testing';
import { StorageService, IDB_OPEN } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  let mockDb: jasmine.SpyObj<any>;
  let openDbSpy: jasmine.Spy;

  beforeEach(() => {
    mockDb = jasmine.createSpyObj('IDBPDatabase', ['add', 'getAllFromIndex', 'delete']);

    openDbSpy = jasmine.createSpy('openDB').and.resolveTo(mockDb);

    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: IDB_OPEN, useValue: openDbSpy }
      ]
    });

    service = TestBed.inject(StorageService);
  });

  it('should be created and initialize database', () => {
    expect(service).toBeTruthy();
    expect(openDbSpy).toHaveBeenCalledWith('PwaOfflineDB', 1, jasmine.any(Object));
  });

  describe('save', () => {
    it('should convert blob to arrayBuffer and add to store', async () => {
      const mockBlob = new Blob(['test-audio-content'], { type: 'audio/webm' });
      const mockMetadata = { duration: 15, waveform: [0.1, 0.2] };
      const mockTimestamp = 1711276000000;

      spyOn(Date, 'now').and.returnValue(mockTimestamp);
      mockDb.add.and.resolveTo(1);

      await service.save('audio', mockBlob, mockMetadata);

      expect(mockDb.add).toHaveBeenCalledWith('sync_queue', jasmine.objectContaining({
        type: 'audio',
        metadata: mockMetadata,
        timestamp: mockTimestamp,
        synced: 0,
        mimeType: 'audio/webm'
      }));

      const lastCallArgs = mockDb.add.calls.mostRecent().args[1];
      expect(lastCallArgs.blob instanceof ArrayBuffer).toBeTrue();
    });
  });

  describe('getUnsynced', () => {
    it('should fetch unsynced items and map them back to Blobs', async () => {
      const mockBuffer = new ArrayBuffer(8);
      const mockDbResults = [
        {
          id: 1,
          type: 'audio',
          blob: mockBuffer,
          synced: 0,
          metadata: { duration: 10, waveform: [] }
        }
      ];

      mockDb.getAllFromIndex.and.resolveTo(mockDbResults);

      const result = await service.getUnsynced();

      expect(mockDb.getAllFromIndex).toHaveBeenCalledWith('sync_queue', 'by-synced', 0);

      expect(result.length).toBe(1);
      expect(result[0].blob instanceof Blob).toBeTrue();
      expect(result[0].blob.type).toBe('audio/mp4'); // Проверка хардкода из вашего маппера
    });
  });

  describe('delete', () => {
    it('should call db.delete with correct id', async () => {
      const idToDelete = 42;
      mockDb.delete.and.resolveTo();

      await service.delete(idToDelete);

      expect(mockDb.delete).toHaveBeenCalledWith('sync_queue', idToDelete);
    });
  });
});
