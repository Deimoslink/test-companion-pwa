import {inject, Injectable} from '@angular/core';
import {openDB, IDBPDatabase} from 'idb';
import { InjectionToken } from '@angular/core';

export const IDB_OPEN = new InjectionToken<typeof openDB>('IDB_OPEN', {
  providedIn: 'root',
  factory: () => openDB
});

export interface BaseEntry {
  id?: number;
  timestamp: number;
  synced: 0 | 1;
  mimeType?: string;
  type: 'audio' | 'image';
}

export interface AudioMetadata {
  name?: string;
  duration: number;
  waveform: number[];
}

export interface AudioOfflineEntry extends BaseEntry {
  type: 'audio';
  metadata: AudioMetadata;
  blob: Blob
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbPromise: Promise<IDBPDatabase>;
  private readonly DB_NAME = 'PwaOfflineDB';
  private readonly STORE_NAME = 'sync_queue';

  private openDbFn = inject(IDB_OPEN);
  // Теперь TS знает, что openDbFn — это функция с аргументами (name, version, callbacks)

  constructor() {
    this.dbPromise = this.openDbFn(this.DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sync_queue')) {
          const store = db.createObjectStore('sync_queue', {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('by-synced', 'synced');
          store.createIndex('by-type', 'type');
        }
      },
    });
  }

  async save(type: 'audio', blob: Blob, metadata: AudioMetadata): Promise<IDBValidKey> {
    const db = await this.dbPromise;
    const buffer = await blob.arrayBuffer();
    const mimeType = blob.type;

    return db.add(this.STORE_NAME, {
      type,
      blob: buffer,
      mimeType,
      metadata,
      timestamp: Date.now(),
      synced: 0
    });
  }

  async getUnsynced(): Promise<AudioOfflineEntry[]> {
    const db = await this.dbPromise;
    const results = await db.getAllFromIndex(this.STORE_NAME, 'by-synced', 0);

    return results.map(item => {
      return {
        ...item,
        blob: new Blob([item.blob], { type: 'audio/mp4' })
      };
    });
  }

  // TODO: sync items after they are loaded to backend, then remove them from IndexedDB

  async delete(id: IDBValidKey): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(this.STORE_NAME, id);
  }
}
