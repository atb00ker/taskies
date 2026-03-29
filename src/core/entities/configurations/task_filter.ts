import type { DatePreset } from '@/core/helpers/date';

export type TaskFilterNode =
  | {
      type: 'collection';
      id: string;
    }
  | {
      type: 'tag';
      tag: string;
    }
  | {
      type: 'dueDate';
      value: DatePreset | Date;
    };

export type TaskFilter =
  | {
      type: 'and';
      filters: TaskFilter[];
    }
  | {
      type: 'or';
      filters: TaskFilter[];
    }
  | TaskFilterNode;

export class TaskFilterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskFilterValidationError';
  }
}

export function assertValidTaskFilter(filter: TaskFilter): void {
  if (filter.type === 'and' || filter.type === 'or') {
    if (filter.filters.length === 0) {
      throw new TaskFilterValidationError(
        `TaskFilter "${filter.type}" must have at least one condition.`,
      );
    }
    for (const child of filter.filters) {
      assertValidTaskFilter(child);
    }
  }
}
