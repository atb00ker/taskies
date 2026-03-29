import type { CollectionProperties } from '@/core/entities/collections';
import type { SourceAuth } from '@/core/entities/sources';
import type { TaskProperties } from '@/core/entities/tasks';

export type CreateTaskInput = Omit<
  TaskProperties,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateTaskInput = Partial<
  Omit<TaskProperties, 'id' | 'createdAt' | 'updatedAt'>
>;

export type CreateCollectionInput = Omit<CollectionProperties, 'id'>;
export type UpdateCollectionInput = Partial<Omit<CollectionProperties, 'id'>>;

export interface ISourceAdapter {
  // Task Management
  getTask(id: string): Promise<TaskProperties>;
  getTasks(id: string): Promise<TaskProperties[]>;
  createTask(task: CreateTaskInput): Promise<TaskProperties>;
  updateTask(id: string, task: UpdateTaskInput): Promise<TaskProperties>;
  deleteTask(id: string): Promise<void>;

  // Collection Management
  createCollection(
    collection: CreateCollectionInput,
  ): Promise<CollectionProperties>;
  updateCollection(
    id: string,
    collection: UpdateCollectionInput,
  ): Promise<CollectionProperties>;
  deleteCollection(id: string): Promise<void>;

  // Authentication
  login?(auth: SourceAuth): Promise<void>;
  logout?(): Promise<void>;
}
