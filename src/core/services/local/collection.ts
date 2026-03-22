import { IndexedDbStore } from '@/core/adapters/indexed_db';
import type {
  Collection,
  CollectionProperties,
} from '@/core/entities/collections';
import type { SourceProperties } from '@/core/entities/sources';
import type { TaskProperties } from '@/core/entities/tasks';
import { DATABASE_SCHEMA } from '@/core/services/schema';

const collectionsStore = new IndexedDbStore<CollectionProperties>(
  'collections',
  DATABASE_SCHEMA,
);
const tasksStore = new IndexedDbStore<TaskProperties>('tasks', DATABASE_SCHEMA);
const sourcesStore = new IndexedDbStore<SourceProperties>(
  'sources',
  DATABASE_SCHEMA,
);

export class CollectionService implements Collection {
  id: string;
  name: string;
  source: string;

  constructor(collection: CollectionProperties) {
    this.id = collection.id;
    this.name = collection.name;
    this.source = collection.source;
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const collection = await collectionsStore.get(id);
    if (!collection) {
      return undefined;
    }
    return new CollectionService(collection);
  }

  async getCollections(): Promise<Collection[]> {
    const collections = await collectionsStore.getAll();
    return collections.map((collection) => new CollectionService(collection));
  }

  async createCollection(collection: CollectionProperties): Promise<void> {
    const source = await sourcesStore.get(collection.source);
    if (!source) {
      throw new Error(
        `Cannot create collection: source "${collection.source}" does not exist.`,
      );
    }

    await collectionsStore.put(collection);
  }

  async updateCollection(collection: CollectionProperties): Promise<void> {
    const source = await sourcesStore.get(collection.source);
    if (!source) {
      throw new Error(
        `Cannot update collection: source "${collection.source}" does not exist.`,
      );
    }

    await collectionsStore.put(collection);
  }

  async deleteCollection(id: string): Promise<void> {
    const { items: tasksInCollection } = await tasksStore.getFiltered({
      indexName: 'byCollection',
      keyRange: IDBKeyRange.only(id),
      limit: Number.MAX_SAFE_INTEGER,
    });
    for (const task of tasksInCollection) {
      await tasksStore.delete(task.id);
    }
    await collectionsStore.delete(id);
  }
}
