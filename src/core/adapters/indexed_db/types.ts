export type IndexedDbIndexSchema = {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
};

export type IndexedDbObjectStoreDefinition = {
  keyPath: string;
  indexes: readonly IndexedDbIndexSchema[];
};

export type IndexedDbSchema = {
  name: string;
  version: number;
  stores: Record<string, IndexedDbObjectStoreDefinition>;
};

export type IndexedDbCursor = {
  key: IDBValidKey;
  primaryKey: IDBValidKey;
};

export type IndexedDbGetFilteredOptions = {
  indexName?: string;
  keyRange?: IDBKeyRange;
  direction?: IDBCursorDirection;
  cursor?: IndexedDbCursor;
  limit?: number;
};

export type IndexedDbGetFilteredResult<T> = {
  items: T[];
  hasMore: boolean;
  cursor?: IndexedDbCursor;
};
