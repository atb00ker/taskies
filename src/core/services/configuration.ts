import { IndexedDbStore } from '@/core/adapters/indexed_db';
import type { CollectionProperties } from '@/core/entities/collections';
import type {
  Configuration,
  ConfigurationProperties,
} from '@/core/entities/configurations';
import { assertValidTaskFilter } from '@/core/entities/configurations/task_filter';
import type { SourceProperties } from '@/core/entities/sources';
import { DATABASE_SCHEMA } from '@/core/services/schema';

const configurationStore = new IndexedDbStore<ConfigurationProperties>(
  'configurations',
  DATABASE_SCHEMA,
);
const sourcesStore = new IndexedDbStore<SourceProperties>(
  'sources',
  DATABASE_SCHEMA,
);
const collectionsStore = new IndexedDbStore<CollectionProperties>(
  'collections',
  DATABASE_SCHEMA,
);

const CONFIGURATION_VERSION = 1;
const DEFAULT_NAME = 'Happy Human';

export class ConfigurationService implements Configuration {
  version: number;
  user: ConfigurationProperties['user'];
  views: ConfigurationProperties['views'];
  defaults: ConfigurationProperties['defaults'];

  constructor({ version, user, views, defaults }: ConfigurationProperties) {
    this.version = version;
    this.user = user;
    this.views = views;
    this.defaults = defaults;
  }

  static async initialize(): Promise<ConfigurationService> {
    const stored = await configurationStore.get(CONFIGURATION_VERSION);

    if (stored) {
      return new ConfigurationService({
        version: stored.version,
        user: {
          name: stored.user.name || DEFAULT_NAME,
          avatar: stored.user.avatar,
        },
        views: stored.views,
        defaults: stored.defaults,
      });
    }

    const sourceId = crypto.randomUUID();
    const collectionId = crypto.randomUUID();

    const source: SourceProperties = {
      id: sourceId,
      name: 'Local',
      kind: 'local',
      auth: { user: '', password: '' },
    };
    await sourcesStore.put(source);

    const collection: CollectionProperties = {
      id: collectionId,
      name: 'My Tasks',
      source: sourceId,
    };
    await collectionsStore.put(collection);

    const initial: ConfigurationProperties = {
      version: CONFIGURATION_VERSION,
      user: {
        name: DEFAULT_NAME,
        avatar: undefined,
      },
      views: [
        {
          id: crypto.randomUUID(),
          name: 'All Tasks',
          filters: undefined,
        },
        {
          id: crypto.randomUUID(),
          name: 'Today',
          filters: { type: 'dueDate', value: 'today' },
        },
        {
          id: crypto.randomUUID(),
          name: 'Tomorrow',
          filters: { type: 'dueDate', value: 'tomorrow' },
        },
        {
          id: crypto.randomUUID(),
          name: 'Week',
          filters: { type: 'dueDate', value: 'week' },
        },
        {
          id: crypto.randomUUID(),
          name: 'Month',
          filters: { type: 'dueDate', value: 'month' },
        },
      ],
      defaults: {
        source: sourceId,
      },
    };
    await configurationStore.put(initial);

    return new ConfigurationService(initial);
  }

  async save(): Promise<void> {
    await saveConfiguration({
      version: this.version,
      user: this.user,
      views: this.views,
      defaults: this.defaults,
    });
  }
}

let singleton: ConfigurationService | null = null;

export async function getConfiguration(): Promise<ConfigurationService> {
  if (!singleton) {
    singleton = await ConfigurationService.initialize();
  }

  return singleton;
}

export async function saveConfiguration(
  config: ConfigurationProperties,
): Promise<void> {
  for (const view of config.views) {
    if (view.filters !== undefined) {
      assertValidTaskFilter(view.filters);
    }
  }

  await configurationStore.put(config);
  singleton = new ConfigurationService({
    version: config.version,
    user: {
      name: config.user.name || DEFAULT_NAME,
      avatar: config.user.avatar,
    },
    views: config.views,
    defaults: config.defaults,
  });
}
