import { IndexedDbStore } from '@/core/adapters/indexed_db';
import { DATABASE_SCHEMA } from '@/core/adapters/indexed_db/schema';
import { LocalAdapter } from '@/core/adapters/local';
import type { CollectionProperties } from '@/core/entities/collections';
import {
  Source,
  type SourceAuth,
  type SourceProperties,
} from '@/core/entities/sources';
import type { TaskProperties } from '@/core/entities/tasks';
import type { ISourceAdapter } from '@/core/ports/source';

const sourcesStore = new IndexedDbStore<SourceProperties>(
  'sources',
  DATABASE_SCHEMA,
);
const collectionsStore = new IndexedDbStore<CollectionProperties>(
  'collections',
  DATABASE_SCHEMA,
);
const tasksStore = new IndexedDbStore<TaskProperties>('tasks', DATABASE_SCHEMA);

export function getSourceAdapter(source: SourceProperties): ISourceAdapter {
  switch (source.kind) {
    case 'local':
      return new LocalAdapter(source);
    case 'caldav':
      throw new Error('CalDAV adapter is not implemented yet.');
    default:
      throw new Error(`Unknown source kind: ${source.kind}`);
  }
}

export class SourceManagerService {
  private _scrubSourceAuth(source: SourceProperties): SourceProperties {
    return {
      ...source,
      auth: {
        user: '',
        password: '',
      },
    };
  }

  async getSource(id: string): Promise<Source | undefined> {
    const source = await sourcesStore.get(id);
    if (!source) {
      return undefined;
    }
    return new Source(this._scrubSourceAuth(source));
  }

  async getSourceWithAuth(id: string): Promise<Source | undefined> {
    const source = await sourcesStore.get(id);
    return source ? new Source(source) : undefined;
  }

  async getSourceForCollection(collectionId: string): Promise<Source> {
    const collection = await collectionsStore.get(collectionId);
    if (!collection) {
      throw new Error(`Collection "${collectionId}" was not found.`);
    }

    const source = await this.getSource(collection.source);
    if (!source) {
      throw new Error(`Source "${collection.source}" was not found.`);
    }

    return source;
  }

  async getSourceForTask(taskId: string): Promise<Source> {
    const task = await tasksStore.get(taskId);
    if (!task) {
      throw new Error(`Task "${taskId}" was not found.`);
    }

    return this.getSourceForCollection(task.collection);
  }

  async getSources(): Promise<Source[]> {
    const sources = await sourcesStore.getAll();
    return sources.map((source) => new Source(this._scrubSourceAuth(source)));
  }

  async createSource(source: SourceProperties): Promise<void> {
    new Source(source);
    await sourcesStore.put(source);
  }

  async updateSource(id: string, source: SourceProperties): Promise<void> {
    if (id !== source.id) {
      throw new Error('Source id mismatch on update.');
    }
    new Source(source);
    await sourcesStore.put(source);
  }

  async deleteSource(id: string): Promise<void> {
    await sourcesStore.delete(id);
  }

  async login(id: string, auth: SourceAuth): Promise<void> {
    const source = await sourcesStore.get(id);
    if (!source) {
      throw new Error(`Source "${id}" was not found.`);
    }

    const adapter = getSourceAdapter(source);
    if (!adapter.login) {
      throw new Error(`Source kind "${source.kind}" does not support login.`);
    }

    await adapter.login(auth);
    await sourcesStore.put({
      ...source,
      auth,
    });
  }

  async logout(id: string): Promise<void> {
    const source = await sourcesStore.get(id);
    if (!source) {
      throw new Error(`Source "${id}" was not found.`);
    }

    const adapter = getSourceAdapter(source);
    if (!adapter.logout) {
      throw new Error(`Source kind "${source.kind}" does not support logout.`);
    }

    await adapter.logout();
    await sourcesStore.put({
      ...source,
      auth: {
        user: '',
        password: '',
      },
    });
  }
}

const sourceManager = new SourceManagerService();

export function getSourceManager(): SourceManagerService {
  return sourceManager;
}
