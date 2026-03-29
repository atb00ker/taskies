import { IndexedDbStore } from '@/core/adapters/indexed_db';
import { DATABASE_SCHEMA } from '@/core/adapters/indexed_db/schema';
import {
  Collection,
  type CollectionProperties,
} from '@/core/entities/collections';
import { getSourceAdapter, getSourceManager } from '@/core/services/source';

const collectionsStore = new IndexedDbStore<CollectionProperties>(
  'collections',
  DATABASE_SCHEMA,
);

export type CreateCollectionInput = Omit<CollectionProperties, 'id'>;
export type UpdateCollectionInput = Partial<
  Omit<CollectionProperties, 'id' | 'source'>
>;

export class CollectionManagerService {
  private readonly sourceManager = getSourceManager();

  async getCollection(id: string): Promise<Collection | undefined> {
    const raw = await collectionsStore.get(id);
    return raw ? new Collection(raw) : undefined;
  }

  async getCollections(): Promise<Collection[]> {
    const rows = await collectionsStore.getAll();
    return rows.map((raw) => new Collection(raw));
  }

  async createCollection(
    collection: CreateCollectionInput,
  ): Promise<Collection> {
    const source = await this.sourceManager.getSourceWithAuth(
      collection.source,
    );
    if (!source) {
      throw new Error(
        `Cannot create collection: source "${collection.source}" does not exist.`,
      );
    }

    const adapter = getSourceAdapter(source.toProperties());
    const created = await adapter.createCollection(collection);
    const entity = new Collection(created);
    await collectionsStore.put(entity.toProperties());
    return entity;
  }

  async updateCollection(
    id: string,
    patch: UpdateCollectionInput,
  ): Promise<Collection> {
    const current = await collectionsStore.get(id);
    if (!current) {
      throw new Error(`Collection "${id}" was not found.`);
    }

    const source = await this.sourceManager.getSourceWithAuth(current.source);
    if (!source) {
      throw new Error(
        `Cannot update collection: source "${current.source}" does not exist.`,
      );
    }

    const adapter = getSourceAdapter(source.toProperties());
    const updated = await adapter.updateCollection(id, patch);
    const entity = new Collection(updated);
    await collectionsStore.put(entity.toProperties());
    return entity;
  }

  async deleteCollection(id: string): Promise<void> {
    const collection = await collectionsStore.get(id);
    if (!collection) {
      return;
    }

    const source = await this.sourceManager.getSourceWithAuth(
      collection.source,
    );
    if (!source) {
      throw new Error(
        `Cannot delete collection: source "${collection.source}" does not exist.`,
      );
    }

    const adapter = getSourceAdapter(source.toProperties());
    await adapter.deleteCollection(id);
    await collectionsStore.delete(id);
  }
}

const collectionManager = new CollectionManagerService();

export function getCollectionManager(): CollectionManagerService {
  return collectionManager;
}
