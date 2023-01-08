import { randomUUID } from 'crypto';

/**
 * The Task class represents an object with an id and data.
 * The id is a randomly generated UUID, and the data is of type T.
 * The Task class includes methods for getting the id and data,
 * and for converting the Task to a serialized object.
 */
export class Task<T> {
  private readonly _id: string;
  private readonly _data: T;

  /**
   * Constructs a new Task object with the specified data.
   * The id is a randomly generated UUID.
   * @param data The data for the Task.
   */
  constructor(data: T) {
    this._id = randomUUID();
    this._data = data;
  }

  /**
   * Returns a new empty Task object with a null data value.
   * @returns A new empty Task object.
   */
  static empty<T>(): Task<T> {
    return new Task<T>(null);
  }

  /**
   * Returns the id of the Task.
   * @returns The id of the Task.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Returns the data of the Task.
   * @returns The data of the Task.
   */
  get data(): T {
    return this._data;
  }

  /**
   * Returns a serialized object containing the id and data of the Task.
   * @return A serialized Task object.
   */
  toJSON() {
    return {
      id: this.id,
      data: this.data,
    };
  }

  /**
   * Returns a new Task object with the data of the provided Task object.
   * @param task The Task object to copy.
   * @returns A new Task object with the data of the provided Task object.
   */
  static fromTask(task: Task<unknown>): Task<unknown> {
    return new Task<unknown>(task.data);
  }
}
