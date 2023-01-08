import { randomUUID } from 'crypto';

export class Task<T> {
  private readonly _id: string;
  private readonly _data: T;

  constructor(data: T) {
    this._id = randomUUID();
    this._data = data;
  }

  static empty<T>(): Task<T> {
    return new Task<T>(null);
  }

  get id(): string {
    return this._id;
  }

  get data(): T {
    return this._data;
  }

  toJSON() {
    return {
      id: this.id,
      data: this.data,
    };
  }

  static fromTask(task: Task<unknown>): Task<unknown> {
    return new Task<unknown>(task.data);
  }
}
