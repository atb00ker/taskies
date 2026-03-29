import { IndexedDbStore } from '@/core/adapters/indexed_db';
import { DATABASE_SCHEMA } from '@/core/adapters/indexed_db/schema';
import {
  Configuration,
  type ConfigurationProperties,
} from '@/core/entities/configurations';
import type { SourceProperties } from '@/core/entities/sources';
import { getCollectionManager } from '@/core/services/collection';
import { getSourceManager } from '@/core/services/source';

const configurationStore = new IndexedDbStore<ConfigurationProperties>(
  'configurations',
  DATABASE_SCHEMA,
);

const CONFIGURATION_VERSION = 1;
const DEFAULT_NAME = 'Happy Human';

export class ConfigurationService extends Configuration {
  constructor(props: ConfigurationProperties) {
    super({
      ...props,
      user: {
        name: props.user.name || DEFAULT_NAME,
        avatar: props.user.avatar,
      },
    });
  }

  static async initialize(): Promise<ConfigurationService> {
    const stored = await configurationStore.get(CONFIGURATION_VERSION);
    const sourceManager = getSourceManager();
    const collectionManager = getCollectionManager();

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

    const source: SourceProperties = {
      id: sourceId,
      name: 'Local',
      kind: 'local',
      auth: { user: '', password: '' },
    };
    await sourceManager.createSource(source);

    await collectionManager.createCollection({
      name: 'My Tasks',
      source: sourceId,
    });

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
        source: source.id,
      },
    };
    new Configuration(initial);
    await configurationStore.put(initial);

    return new ConfigurationService(initial);
  }

  async save(): Promise<void> {
    await saveConfiguration(this.toProperties());
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
  const normalized: ConfigurationProperties = {
    ...config,
    user: {
      name: config.user.name || DEFAULT_NAME,
      avatar: config.user.avatar,
    },
  };

  new Configuration(normalized);
  await configurationStore.put(normalized);
  singleton = new ConfigurationService(normalized);
}
