const DB_NAME = 'prospector-db';
const DB_VERSION = 1;
const STORE_NAME = 'vault-settings';

interface VaultSettings {
  id: string;
  directoryPath: string;
  name: string;
  files: VaultFile[];
  lastAccessed: number;
}

interface VaultFile {
  path: string;
  lastModified: number;
  size: number;
  type: string;
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

  async saveVaultFiles(files: FileList, directoryName: string): Promise<void> {
    if (!this.db) await this.init();
    
    const vaultFiles: VaultFile[] = Array.from(files).map(file => ({
      path: file.webkitRelativePath,
      lastModified: file.lastModified,
      size: file.size,
      type: file.type
    }));
    
    const settings: VaultSettings = {
      id: 'current-vault',
      directoryPath: directoryName,
      name: directoryName,
      files: vaultFiles,
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

  async getVaultSettings(): Promise<VaultSettings | null> {
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
        resolve(result || null);
      };
    });
  }

  async clearVaultSettings(): Promise<void> {
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

  async isValidObsidianVault(files: VaultFile[]): Promise<boolean> {
    return files.some(file => 
      file.path.includes('/.obsidian/') || 
      file.path.endsWith('/.obsidian')
    );
  }

  async getVaultFiles(): Promise<VaultFile[]> {
    const settings = await this.getVaultSettings();
    return settings?.files || [];
  }
}

export const vaultStorage = new VaultStorage();