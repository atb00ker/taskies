import { IndexedDbStore } from '@/core/adapters/indexed_db';
import { DATABASE_SCHEMA } from '@/core/adapters/indexed_db/schema';
import {
  Collection,
  type CollectionProperties,
} from '@/core/entities/collections';
import type { SourceAuth, SourceProperties } from '@/core/entities/sources';
import { Task, type TaskProperties } from '@/core/entities/tasks';
import type {
  CreateCollectionInput,
  CreateTaskInput,
  ISourceAdapter,
  UpdateCollectionInput,
  UpdateTaskInput,
} from '@/core/ports/source';

const tasksStore = new IndexedDbStore<TaskProperties>('tasks', DATABASE_SCHEMA);
const collectionsStore = new IndexedDbStore<CollectionProperties>(
  'collections',
  DATABASE_SCHEMA,
);
const sourcesStore = new IndexedDbStore<SourceProperties>(
  'sources',
  DATABASE_SCHEMA,
);

export class LocalAdapter implements ISourceAdapter {
  constructor(private readonly source: SourceProperties) {}

  private async _getCollection(
    collectionId: string,
  ): Promise<CollectionProperties> {
    const collection = await collectionsStore.get(collectionId);
    if (!collection) {
      throw new Error(`Collection "${collectionId}" was not found.`);
    }

    if (collection.source !== this.source.id) {
      throw new Error(
        `Collection "${collectionId}" does not belong to source "${this.source.id}".`,
      );
    }

    return collection;
  }

  async getTask(id: string): Promise<TaskProperties> {
    const task = await tasksStore.get(id);
    if (!task) {
      throw new Error(`Task "${id}" was not found.`);
    }

    return task;
  }

  async getTasks(id: string): Promise<TaskProperties[]> {
    await this._getCollection(id);
    const { items } = await tasksStore.getFiltered({});
    return items;
  }

  async createTask(task: CreateTaskInput): Promise<TaskProperties> {
    await this._getCollection(task.collection);

    const now = new Date();
    const created: TaskProperties = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      tags: task.tags ?? [],
    };

    const entity = new Task(created);
    await tasksStore.put(entity.toProperties());
    return entity.toProperties();
  }

  async updateTask(
    id: string,
    patch: UpdateTaskInput,
  ): Promise<TaskProperties> {
    const current = await this.getTask(id);
    await this._getCollection(current.collection);

    if (patch.collection !== undefined) {
      await this._getCollection(patch.collection);
    }

    const updated: TaskProperties = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date(),
      tags: patch.tags ?? current.tags,
    };

    const entity = new Task(updated);
    await tasksStore.put(entity.toProperties());
    return entity.toProperties();
  }

  async deleteTask(id: string): Promise<void> {
    const current = await this.getTask(id);
    await this._getCollection(current.collection);
    await tasksStore.delete(id);
  }

  async createCollection(
    collection: CreateCollectionInput,
  ): Promise<CollectionProperties> {
    if (collection.source !== this.source.id) {
      throw new Error(
        `Collection source must be "${this.source.id}" for this adapter.`,
      );
    }

    const created: CollectionProperties = {
      ...collection,
      id: crypto.randomUUID(),
      source: this.source.id,
    };

    const entity = new Collection(created);
    await collectionsStore.put(entity.toProperties());
    return entity.toProperties();
  }

  async updateCollection(
    id: string,
    patch: UpdateCollectionInput,
  ): Promise<CollectionProperties> {
    const current = await this._getCollection(id);
    if (patch.source !== undefined && patch.source !== this.source.id) {
      throw new Error(
        `Collection source must stay "${this.source.id}" for this adapter.`,
      );
    }

    const updated: CollectionProperties = {
      ...current,
      ...patch,
      id: current.id,
      source: this.source.id,
    };

    const entity = new Collection(updated);
    await collectionsStore.put(entity.toProperties());
    return entity.toProperties();
  }

  async deleteCollection(id: string): Promise<void> {
    await this._getCollection(id);

    await tasksStore.deleteByIndex({
      indexName: 'byCollection',
      keyRange: IDBKeyRange.only(id),
    });

    await collectionsStore.delete(id);
  }

  async login(auth: SourceAuth): Promise<void> {
    this.source.auth = auth;
    await sourcesStore.put({
      ...this.source,
      auth: this.source.auth,
    });
  }

  async logout(): Promise<void> {
    this.source.auth = {
      user: '',
      password: '',
    };
    await sourcesStore.put({
      ...this.source,
      auth: this.source.auth,
    });
  }
}
