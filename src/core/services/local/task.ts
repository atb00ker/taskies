import { IndexedDbStore } from '@/core/adapters/indexed_db';
import type { CollectionProperties } from '@/core/entities/collections';
import type { Task, TaskProperties } from '@/core/entities/tasks';
import { DATABASE_SCHEMA } from '@/core/services/schema';

const tasksStore = new IndexedDbStore<TaskProperties>('tasks', DATABASE_SCHEMA);
const collectionsStore = new IndexedDbStore<CollectionProperties>(
  'collections',
  DATABASE_SCHEMA,
);

export class TaskService implements Task {
  id: string;
  collection: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  due?: Date;
  startAt?: Date;
  completedAt?: Date;
  tags: string[];

  constructor(task: TaskProperties) {
    this.id = task.id;
    this.collection = task.collection;
    this.title = task.title;
    this.description = task.description;
    this.createdAt = task.createdAt;
    this.updatedAt = task.updatedAt;
    this.due = task.due;
    this.startAt = task.startAt;
    this.completedAt = task.completedAt;
    this.tags = task.tags;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const task = await tasksStore.get(id);
    if (!task) {
      return undefined;
    }
    return new TaskService(task);
  }

  async getTasks(): Promise<Task[]> {
    const tasks = await tasksStore.getAll();
    return tasks.map((task) => new TaskService(task));
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
