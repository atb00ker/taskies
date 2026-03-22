import { IndexedDbStore } from '@/core/adapters/indexed_db';
import type { Source, SourceProperties } from '@/core/entities/sources';
import { DATABASE_SCHEMA } from '@/core/services/schema';

const sourcesStore = new IndexedDbStore<SourceProperties>(
  'sources',
  DATABASE_SCHEMA,
);

export class SourceService implements Source {
  id: string;
  name: string;
  auth: Source['auth'];
  kind: Source['kind'];

  constructor(source: SourceProperties) {
    this.id = source.id;
    this.name = source.name;
    this.auth = source.auth;
    this.kind = source.kind;
  }

  async getSource(id: string): Promise<Source | undefined> {
    const source = await sourcesStore.get(id);
    if (!source) {
      return undefined;
    }
    return new SourceService({
      id: source.id,
      kind: source.kind,
      name: source.name,
      auth: {
        user: '',
        password: '',
      },
    });
  }

  async getSources(): Promise<Source[]> {
    const sources = await sourcesStore.getAll();
    return sources.map(
      (source) =>
        new SourceService({
          id: source.id,
          kind: source.kind,
          name: source.name,
          auth: {
            user: '',
            password: '',
          },
        }),
    );
  }

  async createSource(source: SourceProperties): Promise<void> {
    await sourcesStore.put(source);
  }

  async updateSource(_id: string, source: SourceProperties): Promise<void> {
    await sourcesStore.put(source);
  }

  async deleteSource(id: string): Promise<void> {
    await sourcesStore.delete(id);
  }

  async login(): Promise<void> {
    await sourcesStore.put({
      id: this.id,
      kind: this.kind,
      name: this.name,
      auth: this.auth,
    });
  }

  async logout(): Promise<void> {
    await sourcesStore.put({
      id: this.id,
      kind: this.kind,
      name: this.name,
      auth: this.auth,
    });
  }
}
