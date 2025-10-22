/**
 * Secure IndexedDB Storage Utility
 * Provides encrypted storage for sensitive wallet and user data
 */

export interface StorageOptions {
  encrypt?: boolean;
  version?: number;
  onUpgrade?: (oldVersion: number, newVersion: number, db: IDBDatabase) => void;
}

export interface StorageItem {
  key: string;
  value: unknown;
  timestamp: number;
  encrypted?: boolean;
}

interface EncryptedValue {
  data: number[];
  iv: number[];
}

export class IndexedDBStorage {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;
  private cryptoKey: CryptoKey | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(dbName: string = 'euclid-storage', options: StorageOptions = {}) {
    this.dbName = dbName;
    this.version = options.version || 1;
  }

  /**
   * Initialize the database and encryption key
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._init();
    return this.initPromise;
  }

  private async _init(): Promise<void> {
    await Promise.all([
      this.initDatabase(),
      this.initCrypto()
    ]);
  }

  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        const storeNames = ['wallet-data', 'user-preferences', 'app-state', 'cache'];

        for (const storeName of storeNames) {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        }
      };
    });
  }

  private async initCrypto(): Promise<void> {
    if (!window.crypto?.subtle) {
      console.warn('Web Crypto API not available - storage will not be encrypted');
      return;
    }

    try {
      // Check if we have a stored key
      const keyData = await this.getStoredCryptoKey();

      if (!keyData) {
        // Generate new key
        this.cryptoKey = await window.crypto.subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256,
          },
          true, // extractable
          ['encrypt', 'decrypt']
        );

        // Store the key
        await this.storeCryptoKey(this.cryptoKey);
      } else {
        // Import stored key
        this.cryptoKey = await window.crypto.subtle.importKey(
          'jwk',
          keyData,
          { name: 'AES-GCM' },
          true,
          ['encrypt', 'decrypt']
        );
      }
    } catch (error) {
      console.warn('Failed to initialize encryption:', error);
    }
  }

  private async getStoredCryptoKey(): Promise<JsonWebKey | null> {
    try {
      const stored = localStorage.getItem('euclid-crypto-key');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private async storeCryptoKey(key: CryptoKey): Promise<void> {
    try {
      const keyData = await window.crypto.subtle.exportKey('jwk', key);
      localStorage.setItem('euclid-crypto-key', JSON.stringify(keyData));
    } catch (error) {
      console.warn('Failed to store crypto key:', error);
    }
  }

  private async encrypt(data: unknown): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    if (!this.cryptoKey || !window.crypto?.subtle) {
      throw new Error('Encryption not available');
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      this.cryptoKey,
      encodedData
    );

    return { encrypted, iv };
  }

  private async decrypt(encrypted: ArrayBuffer, iv: Uint8Array): Promise<unknown> {
    if (!this.cryptoKey || !window.crypto?.subtle) {
      throw new Error('Decryption not available');
    }

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      this.cryptoKey,
      encrypted
    );

    const decodedData = new TextDecoder().decode(decrypted);
    return JSON.parse(decodedData);
  }

  /**
   * Store data securely
   */
  async setItem<T>(
    store: 'wallet-data' | 'user-preferences' | 'app-state' | 'cache',
    key: string,
    value: T,
    options: { encrypt?: boolean } = {}
  ): Promise<void> {
    await this.init();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const shouldEncrypt = options.encrypt !== false && store === 'wallet-data';
    let finalValue: unknown = value;
    let encrypted = false;

    if (shouldEncrypt && this.cryptoKey) {
      try {
        const { encrypted: encryptedData, iv } = await this.encrypt(value);
        finalValue = {
          data: Array.from(new Uint8Array(encryptedData)),
          iv: Array.from(iv)
        };
        encrypted = true;
      } catch (error) {
        console.warn('Encryption failed, storing unencrypted:', error);
      }
    }

    const item: StorageItem = {
      key,
      value: finalValue,
      timestamp: Date.now(),
      encrypted
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to store item: ${request.error?.message}`));
    });
  }

  /**
   * Retrieve data securely
   */
  async getItem<T>(
    store: 'wallet-data' | 'user-preferences' | 'app-state' | 'cache',
    key: string
  ): Promise<T | null> {
    await this.init();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);

      request.onsuccess = async () => {
        const item = request.result as StorageItem;
        if (!item) {
          resolve(null);
          return;
        }

        if (item.encrypted && this.cryptoKey) {
          try {
            const encryptedValue = item.value as EncryptedValue;
            const encryptedData = new Uint8Array(encryptedValue.data);
            const iv = new Uint8Array(encryptedValue.iv);
            const decryptedValue = await this.decrypt(encryptedData.buffer, iv);
            resolve(decryptedValue as T);
          } catch (error) {
            console.error('Decryption failed:', error);
            resolve(null);
          }
        } else {
          resolve(item.value as T);
        }
      };

      request.onerror = () => reject(new Error(`Failed to retrieve item: ${request.error?.message}`));
    });
  }

  /**
   * Remove an item
   */
  async removeItem(
    store: 'wallet-data' | 'user-preferences' | 'app-state' | 'cache',
    key: string
  ): Promise<void> {
    await this.init();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to remove item: ${request.error?.message}`));
    });
  }

  /**
   * Clear all data from a store
   */
  async clear(store: 'wallet-data' | 'user-preferences' | 'app-state' | 'cache'): Promise<void> {
    await this.init();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to clear store: ${request.error?.message}`));
    });
  }

  /**
   * Get all keys from a store
   */
  async getAllKeys(store: 'wallet-data' | 'user-preferences' | 'app-state' | 'cache'): Promise<string[]> {
    await this.init();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAllKeys();

      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(new Error(`Failed to get keys: ${request.error?.message}`));
    });
  }

  /**
   * Clean up old cache entries
   */
  async cleanupCache(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    await this.init();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const cutoff = Date.now() - maxAge;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const objectStore = transaction.objectStore('cache');
      const index = objectStore.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(new Error(`Failed to cleanup cache: ${request.error?.message}`));
    });
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.initPromise = null;
  }
}

// Global storage instance
export const secureStorage = new IndexedDBStorage();

import type { WalletInfo } from '../types/euclid-api.types';

// Convenience functions for common operations
export const walletStorage = {
  async setConnectedWallets(wallets: Map<string, WalletInfo>): Promise<void> {
    const walletsObject = Object.fromEntries(wallets);
    return secureStorage.setItem('wallet-data', 'connected-wallets', walletsObject, { encrypt: true });
  },

  async getConnectedWallets(): Promise<Map<string, WalletInfo>> {
    const walletsObject = await secureStorage.getItem<Record<string, WalletInfo>>('wallet-data', 'connected-wallets');
    return walletsObject ? new Map(Object.entries(walletsObject)) : new Map();
  },

  async setAddressBook(addresses: unknown[]): Promise<void> {
    return secureStorage.setItem('wallet-data', 'address-book', addresses, { encrypt: true });
  },

  async getAddressBook(): Promise<unknown[]> {
    return (await secureStorage.getItem<unknown[]>('wallet-data', 'address-book')) || [];
  },

  async clearWalletData(): Promise<void> {
    return secureStorage.clear('wallet-data');
  }
};

// Migrate from localStorage if exists
export async function migrateFromLocalStorage(): Promise<void> {
  const keysToMigrate = [
    { old: 'euclid-address-book', new: 'address-book', store: 'wallet-data' as const },
    // Add more migration mappings as needed
  ];

  for (const migration of keysToMigrate) {
    try {
      const oldData = localStorage.getItem(migration.old);
      if (oldData) {
        const parsedData = JSON.parse(oldData);
        await secureStorage.setItem(migration.store, migration.new, parsedData);
        localStorage.removeItem(migration.old);
        console.log(`Migrated ${migration.old} to IndexedDB`);
      }
    } catch (error) {
      console.warn(`Failed to migrate ${migration.old}:`, error);
    }
  }
}
