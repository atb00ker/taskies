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
