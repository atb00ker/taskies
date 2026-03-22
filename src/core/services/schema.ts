import type { IndexedDbSchema } from '@/core/adapters/indexed_db/types';

export const DATABASE_SCHEMA = {
  name: 'taskies',
  version: 2,
  stores: {
    configurations: {
      keyPath: 'version',
      indexes: [],
    },
    sources: {
      keyPath: 'id',
      indexes: [],
    },
    collections: {
      keyPath: 'id',
      indexes: [{ name: 'bySource', keyPath: 'source' }],
    },
    tasks: {
      keyPath: 'id',
      indexes: [
        { name: 'byCollection', keyPath: 'collection' },
        { name: 'byUpdatedAt', keyPath: 'updatedAt' },
      ],
    },
  },
} as const satisfies IndexedDbSchema;
