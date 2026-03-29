import { IndexedDbStore } from '@/core/adapters/indexed_db';
import { DATABASE_SCHEMA } from '@/core/adapters/indexed_db/schema';
import type {
  IndexedDbCursor,
  IndexedDbGetFilteredOptions,
} from '@/core/adapters/indexed_db/types';
import type {
  TaskFilter,
  TaskFilterNode,
} from '@/core/entities/configurations/types';
import { Task, type TaskProperties } from '@/core/entities/tasks';
import { DateHelper } from '@/core/helpers/date';
import { HashmapHelper } from '@/core/helpers/hashmap';
import type { CreateTaskInput, UpdateTaskInput } from '@/core/ports/source';
import { getSourceAdapter, getSourceManager } from '@/core/services/source';

const tasksStore = new IndexedDbStore<TaskProperties>('tasks', DATABASE_SCHEMA);

export class TaskManagerService {
  private readonly dateHelper = new DateHelper();
  private readonly hashmap = new HashmapHelper();
  private readonly sourceManager = getSourceManager();

  private async _evaluateFilterNode(
    node: TaskFilterNode,
  ): Promise<Map<string, TaskProperties>> {
    if (node.type === 'collection') {
      const result = await tasksStore.getFiltered({
        indexName: 'byCollection',
        keyRange: IDBKeyRange.only(node.id),
        limit: 0,
      });
      return this.hashmap.toMap('id', result.items);
    }

    if (node.type === 'tag') {
      const result = await tasksStore.getFiltered({
        indexName: 'byTag',
        keyRange: IDBKeyRange.only(node.tag),
        limit: 0,
      });
      return this.hashmap.toMap('id', result.items);
    }

    if (node.type === 'dueDate') {
      const [start, end] = this.dateHelper.getDateRange(node.value);
      const result = await tasksStore.getFiltered({
        indexName: 'byDueDate',
        keyRange: IDBKeyRange.bound(start, end),
        limit: 0,
      });
      return this.hashmap.toMap('id', result.items);
    }

    return new Map<string, TaskProperties>();
  }

  private async _evaluateFilters(
    filter: TaskFilter,
  ): Promise<Map<string, TaskProperties>> {
    if (filter.type === 'and') {
      if (filter.filters.length === 0) {
        return new Map<string, TaskProperties>();
      }

      const results = (
        await Promise.all(
          filter.filters.map((subFilter) => this._evaluateFilters(subFilter)),
        )
      ).sort((a, b) => a.size - b.size);

      return results[0].size === 0
        ? new Map<string, TaskProperties>()
        : this.hashmap.intersect(results);
    }

    if (filter.type === 'or') {
      if (filter.filters.length === 0) {
        return new Map<string, TaskProperties>();
      }

      const results = await Promise.all(
        filter.filters.map((subFilter) => this._evaluateFilters(subFilter)),
      );
      return this.hashmap.union(results);
    }

    return this._evaluateFilterNode(filter);
  }

  async getTask(id: string): Promise<Task | undefined> {
    const raw = await tasksStore.get(id);
    return raw ? new Task(raw) : undefined;
  }

  async getTasks(options: IndexedDbGetFilteredOptions = {}): Promise<{
    items: Task[];
    hasMore: boolean;
    cursor?: IndexedDbCursor;
  }> {
    const result = await tasksStore.getFiltered({
      ...options,
    });
    return {
      ...result,
      items: result.items.map((raw) => new Task(raw)),
    };
  }

  async getFilteredTasks(filters?: TaskFilter): Promise<{
    items: Task[];
    hasMore: boolean;
    cursor?: IndexedDbCursor;
  }> {
    if (filters === undefined) {
      return this.getTasks();
    }

    const taskMap = await this._evaluateFilters(filters);
    return {
      items: Array.from(taskMap.values()).map((raw) => new Task(raw)),
      hasMore: false,
      cursor: undefined,
    };
  }

  async createTask(task: CreateTaskInput): Promise<Task> {
    const source = await this.sourceManager.getSourceForCollection(
      task.collection,
    );
    const adapter = getSourceAdapter(source.toProperties());
    const created = await adapter.createTask(task);
    const entity = new Task(created);
    await tasksStore.put(entity.toProperties());
    return entity;
  }

  async updateTask(id: string, task: UpdateTaskInput): Promise<Task> {
    const current = await this.getTask(id);
    if (!current) {
      throw new Error(`Task "${id}" was not found.`);
    }

    const source = await this.sourceManager.getSourceForCollection(
      current.data.collection,
    );

    if (
      task.collection !== undefined &&
      task.collection !== current.data.collection
    ) {
      const nextSource = await this.sourceManager.getSourceForCollection(
        task.collection,
      );
      if (nextSource.data.id !== source.data.id) {
        throw new Error('Cross-source task moves are not supported.');
      }
    }

    const adapter = getSourceAdapter(source.toProperties());
    const updated = await adapter.updateTask(id, task);
    const entity = new Task(updated);
    await tasksStore.put(entity.toProperties());
    return entity;
  }

  async deleteTask(id: string): Promise<void> {
    const source = await this.sourceManager.getSourceForTask(id);
    const adapter = getSourceAdapter(source.toProperties());
    await adapter.deleteTask(id);
    await tasksStore.delete(id);
  }
}

const taskManager = new TaskManagerService();

export function getTaskManager(): TaskManagerService {
  return taskManager;
}
