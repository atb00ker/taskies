import { IndexedDbStore } from '@/core/adapters/indexed_db';
import type {
  IndexedDbCursor,
  IndexedDbGetFilteredOptions,
} from '@/core/adapters/indexed_db/types';
import type { CollectionProperties } from '@/core/entities/collections';
import type {
  TaskFilter,
  TaskFilterNode,
} from '@/core/entities/configurations/task_filter';
import type { Task, TaskProperties } from '@/core/entities/tasks';
import { DateHelper } from '@/core/helpers/date';
import { HashmapHelper } from '@/core/helpers/hashmap';
import { DATABASE_SCHEMA } from '@/core/services/schema';

const FILTER_PAGE_SIZE = 200;
const tasksStore = new IndexedDbStore<TaskProperties>('tasks', DATABASE_SCHEMA);
const collectionsStore = new IndexedDbStore<CollectionProperties>(
  'collections',
  DATABASE_SCHEMA,
);

export class TaskService implements Task {
  private _dateHelper = new DateHelper();
  private _hashmap = new HashmapHelper();
  id: string;
  collection: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];

  constructor(task: TaskProperties) {
    this.id = task.id;
    this.collection = task.collection;
    this.title = task.title;
    this.description = task.description;
    this.createdAt = task.createdAt;
    this.updatedAt = task.updatedAt;
    this.dueDate = task.dueDate;
    this.tags = task.tags;
  }

  private async _getAllTasks(
    options: Omit<IndexedDbGetFilteredOptions, 'cursor' | 'limit'>,
  ): Promise<TaskProperties[]> {
    const items: TaskProperties[] = [];
    let cursor: IndexedDbCursor | undefined;
    let hasMore = true;

    while (hasMore) {
      const result = await tasksStore.getFiltered({
        ...options,
        cursor,
        limit: FILTER_PAGE_SIZE,
      });
      items.push(...result.items);
      cursor = result.cursor;
      hasMore = result.hasMore;
    }

    return items;
  }

  private async _evaluateFilterNode(
    node: TaskFilterNode,
  ): Promise<Map<string, TaskProperties>> {
    if (node.type === 'collection') {
      const result = await this._getAllTasks({
        indexName: 'byCollection',
        keyRange: IDBKeyRange.only(node.id),
      });
      return this._hashmap.toMap('id', result);
    }

    if (node.type === 'tag') {
      const result = await this._getAllTasks({
        indexName: 'byTag',
        keyRange: IDBKeyRange.only(node.tag),
      });
      return this._hashmap.toMap('id', result);
    }

    if (node.type === 'dueDate') {
      const [start, end] = this._dateHelper.getDateRange(node.value);
      const result = await this._getAllTasks({
        indexName: 'byDueDate',
        keyRange: IDBKeyRange.bound(start, end),
      });
      return this._hashmap.toMap('id', result);
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

      // Since results are sorted by size, if the first result is empty, then the results of others doesn't matter as it's "and" operation.
      return results[0].size === 0
        ? new Map<string, TaskProperties>()
        : this._hashmap.intersect(results);
    }

    if (filter.type === 'or') {
      if (filter.filters.length === 0) {
        return new Map<string, TaskProperties>();
      }

      const results = await Promise.all(
        filter.filters.map((subFilter) => this._evaluateFilters(subFilter)),
      );
      return this._hashmap.union(results);
    }

    return this._evaluateFilterNode(filter);
  }

  async getTask(id: string): Promise<Task | undefined> {
    const task = await tasksStore.get(id);
    if (!task) {
      return undefined;
    }
    return new TaskService(task);
  }

  async getTasks(options: IndexedDbGetFilteredOptions): Promise<{
    items: TaskProperties[];
    hasMore: boolean;
    cursor?: IndexedDbCursor;
  }> {
    return tasksStore.getFiltered({
      ...options,
      limit: FILTER_PAGE_SIZE,
    });
  }

  async getFilteredTasks(filters: TaskFilter): Promise<{
    items: TaskProperties[];
    hasMore: boolean;
    cursor?: IndexedDbCursor;
  }> {
    if (filters === undefined) {
      return this.getTasks({
        limit: FILTER_PAGE_SIZE,
      });
    }

    const taskMap = await this._evaluateFilters(filters);
    return {
      items: Array.from(taskMap.values()).map((task) => new TaskService(task)),
      hasMore: false,
      cursor: undefined,
    };
  }

  async createTask(task: TaskProperties): Promise<void> {
    const collection = await collectionsStore.get(task.collection);
    if (!collection) {
      throw new Error(
        `Cannot create task: collection "${task.collection}" does not exist.`,
      );
    }
    await tasksStore.put(task);
  }

  async updateTask(id: string, task: TaskProperties): Promise<void> {
    if (task.id !== id) {
      throw new Error('Task id mismatch on update.');
    }
    const collection = await collectionsStore.get(task.collection);
    if (!collection) {
      throw new Error(
        `Cannot update task: collection "${task.collection}" does not exist.`,
      );
    }
    await tasksStore.put(task);
  }

  async deleteTask(id: string): Promise<void> {
    await tasksStore.delete(id);
  }
}
