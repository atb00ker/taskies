export type TaskProperties = {
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
};

export interface Task extends TaskProperties {
  getTask(id: string): Promise<Task | undefined>;
  getTasks(): Promise<Task[]>;
  createTask(task: TaskProperties): Promise<void>;
  updateTask(id: string, task: TaskProperties): Promise<void>;
  deleteTask(id: string): Promise<void>;
}
