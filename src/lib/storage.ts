const DB_NAME = 'prospector-db';
const DB_VERSION = 1;
const STORE_NAME = 'vault-settings';

interface VaultSettings {
  id: string;
  directoryHandle: FileSystemDirectoryHandle;
  name: string;
  lastAccessed: number;
}

class VaultStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    if (!this.db) await this.init();
    
    const settings: VaultSettings = {
      id: 'current-vault',
      directoryHandle: handle,
      name: handle.name,
      lastAccessed: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([STORE_NAME], 'readwrite');
      if (!transaction) {
        reject(new Error('Database not initialized'));
        return;
      }
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(settings);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([STORE_NAME], 'readonly');
      if (!transaction) {
        reject(new Error('Database not initialized'));
        return;
      }
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('current-vault');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as VaultSettings | undefined;
        resolve(result?.directoryHandle || null);
      };
    });
  }

  async clearDirectoryHandle(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([STORE_NAME], 'readwrite');
      if (!transaction) {
        reject(new Error('Database not initialized'));
        return;
      }
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete('current-vault');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async verifyDirectoryAccess(handle: FileSystemDirectoryHandle): Promise<boolean> {
    try {
      const permission = await handle.queryPermission({ mode: 'read' });
      if (permission === 'granted') {
        return true;
      }
      
      // Try to request permission if not granted
      const requestPermission = await handle.requestPermission({ mode: 'read' });
      return requestPermission === 'granted';
    } catch (_error) {
      return false;
    }
  }
}

export const vaultStorage = new VaultStorage();