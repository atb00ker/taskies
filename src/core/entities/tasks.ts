import type {
  IndexedDbCursor,
  IndexedDbGetFilteredOptions,
} from '@/core/adapters/indexed_db/types';
import type { TaskFilter } from '@/core/entities/configurations/task_filter';

export type TaskProperties = {
  id: string;
  collection: string;

  title: string;
  description: string;

  createdAt: Date;
  updatedAt: Date;

  dueDate?: Date;

  tags: string[];
};

export interface Task extends TaskProperties {
  getTask(id: string): Promise<Task | undefined>;
  getTasks(options: IndexedDbGetFilteredOptions): Promise<{
    items: TaskProperties[];
    hasMore: boolean;
    cursor?: IndexedDbCursor;
  }>;
  getFilteredTasks(filters?: TaskFilter): Promise<{
    items: TaskProperties[];
    hasMore: boolean;
    cursor?: IndexedDbCursor;
  }>;

  createTask(task: TaskProperties): Promise<void>;
  updateTask(id: string, task: TaskProperties): Promise<void>;
  deleteTask(id: string): Promise<void>;
}
