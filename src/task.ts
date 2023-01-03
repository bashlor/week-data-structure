import { TaskDescriptor } from './type/task.util';
import { randomUUID } from 'crypto';

export class Task {
  private readonly _key: string;
  private readonly _id: number;
  private readonly _name: string;
  private readonly _domain: string;
  private readonly _description: string;

  constructor(name: string, domain: string, description: string) {
    this._key = randomUUID();
    this._id = Task.getId().next().value as number;
    this._name = name;
    this._domain = domain;
    this._description = description;
  }

  private static *getId() {
    let count = 0;
    while (true) {
      yield count++;
    }
  }

  toJSON(): TaskDescriptor {
    return {
      key: this._key,
      id: this._id,
      name: this._name,
      description: this._description,
      domain: this._domain,
    };
  }
}
