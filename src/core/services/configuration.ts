import { IndexedDbStore } from '@/core/adapters/indexed_db';
import type {
  Configuration,
  ConfigurationProperties,
} from '@/core/entities/configurations';
import { DATABASE_SCHEMA } from '@/core/services/schema';

const configurationStore = new IndexedDbStore<ConfigurationProperties>(
  'configurations',
  DATABASE_SCHEMA,
);

const CONFIGURATION_VERSION = 1;

export class ConfigurationService implements Configuration {
  version: number;
  defaults: ConfigurationProperties['defaults'];

  constructor({ version, defaults }: ConfigurationProperties) {
    this.version = version;
    this.defaults = defaults;
  }

  static async initialize(): Promise<ConfigurationService> {
    const stored = await configurationStore.get(CONFIGURATION_VERSION);

    if (stored) {
      return new ConfigurationService({
        version: stored.version,
        defaults: stored.defaults,
      });
    }

    const defaults: ConfigurationProperties = {
      version: CONFIGURATION_VERSION,
      defaults: { source: undefined },
    };

    await configurationStore.put({ ...defaults });

    return new ConfigurationService(defaults);
  }
}

let singleton: ConfigurationService | null = null;

export async function getConfiguration(): Promise<ConfigurationService> {
  if (!singleton) {
    singleton = await ConfigurationService.initialize();
  }

  return singleton;
}
