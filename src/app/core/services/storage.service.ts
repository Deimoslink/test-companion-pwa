import {Injectable} from '@angular/core';
import {openDB, IDBPDatabase} from 'idb';

export interface OfflineEntry {
  id?: number;
  type: 'audio' | 'image';
  blob: Blob;
  timestamp: number;
  synced: 0 | 1;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbPromise: Promise<IDBPDatabase>;
  private readonly DB_NAME = 'PwaOfflineDB';
  private readonly STORE_NAME = 'sync_queue';

  constructor() {
    this.dbPromise = openDB(this.DB_NAME, 1, {
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

  async save(type: 'audio' | 'image', blob: Blob, metadata: any = {}): Promise<number> {
    const db = await this.dbPromise;
    return db.add(this.STORE_NAME, {
      type,
      blob,
      metadata,
      timestamp: Date.now(),
      synced: 0
    }) as Promise<number>;
  }

  async getUnsynced(): Promise<OfflineEntry[]> {
    const db = await this.dbPromise;
    const results = await db.getAllFromIndex(this.STORE_NAME, 'by-synced', 0);

    return results as OfflineEntry[];
  }

  // TODO: sync items after they are loaded to backend, then remove them from IndexedDB
  async markAsSynced(id: number): Promise<void> {
    const db = await this.dbPromise;
    const item = await db.get(this.STORE_NAME, id);
    if (item) {
      item.synced = 1;
      await db.put(this.STORE_NAME, item);
    }
  }

  async delete(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(this.STORE_NAME, id);
  }
}
