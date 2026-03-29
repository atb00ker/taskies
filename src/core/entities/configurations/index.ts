import type { TaskFilter } from '@/core/entities/configurations/task_filter';

export type ConfigurationProperties = {
  version: number;
  user: {
    name: string;
    avatar: string | undefined;
  };
  views: {
    id: string;
    name: string;
    filters?: TaskFilter;
  }[];
  defaults: {
    source: string | undefined;
  };
};

export interface Configuration extends ConfigurationProperties {}
