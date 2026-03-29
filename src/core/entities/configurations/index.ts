import type { TaskFilter } from '@/core/entities/configurations/types';
import { TaskFilterValidationError } from '@/core/helpers/error';

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

export class Configuration {
  readonly data: ConfigurationProperties;

  constructor(data: ConfigurationProperties) {
    for (const view of data.views) {
      if (view.filters !== undefined) {
        this._assertFilterValidity(view.filters);
      }
    }

    this.data = data;
  }

  private _assertFilterValidity(filter: TaskFilter): void {
    if (filter.type === 'and' || filter.type === 'or') {
      if (filter.filters.length === 0) {
        throw new TaskFilterValidationError(
          `TaskFilter "${filter.type}" must have at least one condition.`,
        );
      }
      for (const child of filter.filters) {
        this._assertFilterValidity(child);
      }
    }
  }

  toProperties(): ConfigurationProperties {
    return this.data;
  }
}
