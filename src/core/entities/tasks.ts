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

export class Task {
  readonly data: TaskProperties;

  constructor(data: TaskProperties) {
    if (!data.title.trim()) {
      throw new Error('Task title cannot be empty.');
    }

    this.data = data;
  }

  toProperties(): TaskProperties {
    return this.data;
  }
}
