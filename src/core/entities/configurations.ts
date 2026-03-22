export type ConfigurationProperties = {
  version: number;
  defaults: {
    source: string | undefined;
  };
};

export interface Configuration extends ConfigurationProperties {}
