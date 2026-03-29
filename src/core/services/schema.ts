import type { IndexedDbSchema } from '@/core/adapters/indexed_db/types';

export const DATABASE_SCHEMA = {
  name: 'taskies',
  version: 1,
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
        { name: 'byDueDate', keyPath: 'dueDate' },
        { name: 'byTag', keyPath: 'tags', options: { multiEntry: true } },
      ],
    },
  },
} as const satisfies IndexedDbSchema;
