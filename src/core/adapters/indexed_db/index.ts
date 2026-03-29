import type {
  IndexedDbCursor,
  IndexedDbDeleteByIndexOptions,
  IndexedDbGetFilteredOptions,
  IndexedDbGetFilteredResult,
  IndexedDbSchema,
} from '@/core/adapters/indexed_db/types';

const DEFAULT_FILTER_PAGE_SIZE = 200;

export class IndexedDbStore<T> {
  constructor(
    private readonly table: string,
    private readonly schema: IndexedDbSchema,
  ) {}

  private open(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return Promise.reject(
        new Error('IndexedDB is only available in a browser environment.'),
      );
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.schema.name, this.schema.version);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        const tx = (event.target as IDBOpenDBRequest).transaction;

        if (!tx) {
          reject(new Error('IndexedDB upgrade missing transaction.'));
          return;
        }

        if (event.oldVersion < this.schema.version) {
          for (const storeName of Array.from(db.objectStoreNames)) {
            if (!Object.keys(this.schema.stores).includes(storeName)) {
              db.deleteObjectStore(storeName);
            }
          }
        }

        for (const [storeName, storeSchema] of Object.entries(
          this.schema.stores,
        )) {
          let store: IDBObjectStore;
          if (!db.objectStoreNames.contains(storeName)) {
            store = db.createObjectStore(storeName, {
              keyPath: storeSchema.keyPath,
            });
          } else {
            store = tx.objectStore(storeName);
          }

          for (const idx of storeSchema.indexes) {
            if (!store.indexNames.contains(idx.name)) {
              store.createIndex(idx.name, idx.keyPath, idx.options);
            }
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
    });
  }

  async get(key: IDBValidKey): Promise<T | undefined> {
    const db = await this.open();

    return new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction(this.table, 'readonly');
      const store = transaction.objectStore(this.table);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result ?? undefined);
    });
  }

  async getAll(): Promise<T[]> {
    const db = await this.open();

    return new Promise<T[]>((resolve, reject) => {
      const transaction = db.transaction(this.table, 'readonly');
      const store = transaction.objectStore(this.table);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Walks the store or an index with a cursor, returns up to `limit` rows and
   * whether more rows exist after this page.
   *
   * **`limit`:** `0` means no pagination — returns every matching row in one
   * response with `hasMore: false`. Otherwise defaults to `200`.
   *
   * **Pagination:** Pass `cursor` from the previous response to continue after
   * the last row (key + primaryKey identify the cursor position in IDB order).
   * - With an **index**, the first step uses `continuePrimaryKey` to jump after
   *   that position without scanning from the start of the range.
   * - On the **object store** only, `openCursor` uses an exclusive lower bound
   *   on `primaryKey` instead, so no extra seek is needed on the first row.
   */
  async getFiltered(
    options: IndexedDbGetFilteredOptions = {},
  ): Promise<IndexedDbGetFilteredResult<T>> {
    const {
      indexName,
      keyRange,
      direction = 'next',
      cursor,
      limit = DEFAULT_FILTER_PAGE_SIZE,
    } = options;

    const pageSize = Math.max(0, limit);
    const unlimited = pageSize === 0;

    if (!indexName && cursor) {
      if (keyRange !== undefined) {
        throw new Error(
          'IndexedDbStore.getFiltered: cursor on an object store requires omitting keyRange, or use an index.',
        );
      }
    }

    const cursorKeyRange =
      !indexName && cursor
        ? IDBKeyRange.lowerBound(cursor.primaryKey, true)
        : keyRange;

    const db = await this.open();

    return new Promise<IndexedDbGetFilteredResult<T>>((resolve, reject) => {
      const transaction = db.transaction(this.table, 'readonly');
      const store = transaction.objectStore(this.table);
      const source = indexName ? store.index(indexName) : store;
      const request = source.openCursor(cursorKeyRange, direction);

      const items: T[] = [];
      let checkHasMore = false;
      let updatedCursor: IndexedDbCursor | undefined;
      let resumeCursor = indexName && cursor ? cursor : undefined;

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve({
            items,
            hasMore: false,
            cursor: updatedCursor,
          });
          return;
        }

        if (resumeCursor) {
          const resume = resumeCursor;
          resumeCursor = undefined;
          cursor.continuePrimaryKey(resume.key, resume.primaryKey);
          return;
        }

        if (checkHasMore) {
          resolve({
            items,
            hasMore: true,
            cursor: updatedCursor,
          });
          return;
        }

        const value = cursor.value as T;

        if (unlimited || items.length < pageSize) {
          items.push(value);
          updatedCursor = {
            key: cursor.key as IDBValidKey,
            primaryKey: cursor.primaryKey as IDBValidKey,
          };
          if (!unlimited && items.length === pageSize) {
            checkHasMore = true;
          }
          cursor.continue();
          return;
        }
      };
    });
  }

  async put(value: T): Promise<void> {
    const db = await this.open();

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.table, 'readwrite');
      const store = transaction.objectStore(this.table);
      store.put(value);

      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
  }

  async delete(key: IDBValidKey): Promise<void> {
    const db = await this.open();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.table, 'readwrite');
      const store = transaction.objectStore(this.table);
      store.delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
  }

  /**
   * Deletes all records matching `keyRange` on the given index by walking the
   * index cursor — no `getAll` / materialized row list.
   */
  async deleteByIndex(options: IndexedDbDeleteByIndexOptions): Promise<void> {
    const { indexName, keyRange, direction = 'next' } = options;
    const db = await this.open();

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.table, 'readwrite');
      const store = transaction.objectStore(this.table);
      const index = store.index(indexName);
      const request = index.openCursor(keyRange, direction);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          return;
        }
        cursor.delete();
        cursor.continue();
      };

      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
  }

  async clear(): Promise<void> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.table, 'readwrite');
      const store = transaction.objectStore(this.table);
      store.clear();

      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
  }
}
