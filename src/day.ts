import { TimeslotSeries } from './timeslot-series';
import { DayType, DayLabels, DayTypeEnum } from './type/date.type';
import { Timeslot } from './timeslot';
import { Task } from './task';
import { DayParsable, DaySerializable, DayToStringOptions } from './type/day.type';
import { WeekDataStructureError } from './error/week-data-structure.error';
import { DAY_TIME_SEPARATOR } from './constant/time.constant';
import { TimeslotSeriesOptions } from './type/timeslot.type';
import { Time } from './time';
import { DEFAULT_END_DAY_LIMIT, DEFAULT_START_DAY_LIMIT } from './constant/day.constant';

/**
 * A class representing a day in a week, with a set of timeslots and tasks.
 * @extends {Map<string, Task<T> | null>}
 * @template T - The type parameter for the Task class.
 */
export class Day<T> extends Map<string, Task<T> | null> {
  private readonly _options: TimeslotSeriesOptions;
  private readonly _dayOfWeek: DayType;

  constructor(value: DayTypeEnum, options?: TimeslotSeriesOptions);
  constructor(value: DayType, options?: TimeslotSeriesOptions);
  constructor(value: DayParsable, options?: TimeslotSeriesOptions);
  constructor(value: Day<T>, options?: TimeslotSeriesOptions);
  constructor(value?: undefined, options?: TimeslotSeriesOptions);

  /**
   * Creates a new Day object.
   * This constructor method creates a new Day object based on the given value and options.
   * If value is not provided or is null or undefined, the Day object will be initialized with default values.
   * If value is a Day object, the new Day object will be a copy of the given object.
   * If value is a DayParsable object, the Day object will be created from the dayOfWeek and timeslots properties of the object.
   * If value is a DayType string or a DayTypeEnum number, the Day object will be initialized with the corresponding day of the week.
   * @param {Day<T> | DayParsable | DayType | DayTypeEnum | null | undefined} value - The value to initialize the Day object with. Can be a Day object, an object with dayOfWeek and timeslots properties, a string or number representing the day of the week, null, or undefined.
   * @param {TimeslotSeriesOptions} [options] - Optional options for the TimeslotSeries object of the Day.
   */
  constructor(value: Day<T> | DayParsable | DayType | DayTypeEnum | null | undefined, options?: TimeslotSeriesOptions) {
    if (value === null || typeof value === 'undefined') {
      super();
      this._dayOfWeek = DayLabels[0];
      this._options = options ?? Day.getDefaultTimeslotSeriesOptions();
      return;
    }

    if (
      Object.prototype.hasOwnProperty.call(value, 'dayOfWeek') &&
      Object.prototype.hasOwnProperty.call(value, 'timeslots')
    ) {
      const { dayOfWeek, timeslots } = (value as DayParsable) || {};

      const parsedTimeslots = timeslots.map((timeslot) => new Timeslot(timeslot));

      if (options) {
        Day.ensureTimeslotsAreInLimit(parsedTimeslots, options);
      }

      const timeslotsEntries = timeslots
        .map((timeslot) => [new Timeslot(timeslot), null] as [Timeslot, Task<T> | null])
        .map(([timeslot, task]) => [timeslot.toString(), task] as [string, Task<T> | null]);
      super(timeslotsEntries);
      this._dayOfWeek = dayOfWeek;
      this._options = options ?? Day.getDefaultTimeslotSeriesOptions();
      return;
    }

    if (value instanceof Day) {
      const timeslots = [...value.entries()];
      super(timeslots);
      this._dayOfWeek = value.day;
      this._options = options ?? Day.getDefaultTimeslotSeriesOptions();
      return;
    }

    if (typeof value === 'number' && DayTypeEnum[value] !== undefined) {
      super();
      this._dayOfWeek = DayLabels[value];
      this._options = options ?? Day.getDefaultTimeslotSeriesOptions();
      return;
    }

    super();
    this._options = options ?? Day.getDefaultTimeslotSeriesOptions();
  }

  /**
   * Gets the day of the week for the Day object.
   * @returns {DayType} The day of the week.
   */
  get day(): DayType {
    return this._dayOfWeek;
  }

  /**
   * Gets the TimeslotSeriesOptions object for the Day object.
   * @returns {TimeslotSeriesOptions} The TimeslotSeriesOptions object.
   */
  get specs(): TimeslotSeriesOptions {
    return this._options;
  }


  /**
   * Gets the array of Timeslot objects for the Day object.
   * @returns {Timeslot[]} The array of Timeslot objects.
   */
  get timeslots(): Timeslot[] {
    return [...super.keys()].map((timeslot) => Timeslot.fromString(timeslot));
  }

  /**
   * Gets the TimeslotSeries object for the Day object.
   * @returns {TimeslotSeries} The TimeslotSeries object.
   */
  get timeslotSeries(): TimeslotSeries {
    return TimeslotSeries.fromArray(this.timeslots, this._options);
  }



  /**
   * Compares the Day object with another Day object.
   * @param {Day<T>} that - The Day object to compare with.
   * @returns {number} A number indicating the order of the days. If this Day object is before the other Day object, a negative number is returned. If the days are the same, 0 is returned. If this Day object is after the other Day object, a positive number is returned.
   */
  compareTo(that: Day<T>): number {
    return DayLabels.indexOf(this.day) - DayLabels.indexOf(that.day);
  }

  /**
   * Indicates whether the Day object is after another Day object.
   * @param {Day<T>} that - The Day object to compare with.
   * @returns {boolean} A boolean indicating whether this Day object is after the other Day object.
   */
  isAfter(that: Day<T>) {
    return this.compareTo(that) > 0;
  }

  /**
   * Indicates whether the Day object is equal to another Day object.
   * @param {Day<T>} that - The Day object to compare with.
   * @returns {boolean} A boolean indicating whether this Day object is equal to the other Day object.
   */
  equals(that: Day<T>): boolean {
    if (this.toString() !== that.toString()) {
      return false;
    }
    const compareOptions = (a: TimeslotSeriesOptions, b: TimeslotSeriesOptions) => {
      if (a.defaultStartLimit) {
        if (!b.defaultStartLimit) {
          return false;
        }
        if (!a.defaultStartLimit.equals(b.defaultStartLimit)) {
          return false;
        }
      }

      if (a.defaultEndLimit) {
        if (!b.defaultEndLimit) {
          return false;
        }
        if (!a.defaultEndLimit.equals(b.defaultEndLimit)) {
          return false;
        }
      }

      return true;
    };

    const compareTasks = (tasksA:Task<T>[], tasksB: Task<T>[]) => {
      if (tasksA.length !== tasksB.length) {
        return false;
      }

      return tasksA.every((taskA) => tasksB.find((taskB) => taskA.id === taskB.id));
    };

    return this.toString() === that.toString() && compareOptions(this.specs, that.specs) && compareTasks(this.tasks, that.tasks);
  }

  /**
   * Sets the value for the specified key in the Day object.
   * @param {Timeslot | string} key - The key of the value to set. Can be a Timeslot object or a string representation of a Timeslot.
   * @param {Task<T>} task - The value to set.
   * @returns {this} The Day object.
   */
  set(key: Timeslot | string, task: Task<T>): this {
    const timeslot = typeof key === 'string' ? key : key.toString();
    super.set(timeslot, task);
    return this;
  }

  /**
   * Inserts a new Task object into the Day object, splitting any existing Timeslot objects if necessary.
   * @param {string} key - The string representation of the Timeslot object to insert the Task into.
   * @param {Task<T>} task - The Task object to insert.
   * @returns {Timeslot} The Timeslot object that the Task was inserted into.
   */
  insert(key: string, task: Task<T>): Timeslot;

  /**
   * Inserts a new Task object into the Day object, splitting any existing Timeslot objects if necessary.
   * @param {Timeslot} key - The Timeslot object to insert the Task into.
   * @param {Task<T>} task - The Task object to insert.
   * @returns {Timeslot} The Timeslot object that the Task was inserted into.
   */
  insert(key: Timeslot, task: Task<T>): Timeslot;

  insert(key: Timeslot | string, task: Task<T>): Timeslot {
    const timeslot = typeof key === 'string' ? Timeslot.fromString(key) : key;
    const timeslotAvailable = [...super.keys()].find(
      (t) => Timeslot.fromString(t).contains(timeslot) && super.get(t) === null,
    );
    if (!timeslotAvailable) {
      throw new WeekDataStructureError(`Cannot insert ${key}. There's no timeslots that can contain it.`, 'Day');
    }
    const deleteResult = this.delete(timeslotAvailable);
    if (!deleteResult) {
      throw new WeekDataStructureError(
        `Unexpected Error. Cannot delete ${timeslotAvailable} before inserting ${timeslot}`,
        'Day',
      );
    }
    const [merged, rest] = Timeslot.mergeTimeslotIntersection(Timeslot.fromString(timeslotAvailable), timeslot);
    this.set(merged, task);
    for (const r of rest) {
      this.set(r, null);
    }
    return merged;
  }

  /**
   * Gets a serializable representation of the Day object.
   * @returns {DaySerializable} A serializable representation of the Day object.
   */
  toJSON(): DaySerializable {
    return {
      dayOfWeek: this._dayOfWeek,
      timeslots: [...super.keys()].map((timeslot) => Timeslot.fromString(timeslot).toJSON()),
    };
  }


  /**
   * Gets an array of the Task objects in the Day object.
   * @returns {Array<Task<T>>} An array of the Task objects in the Day object.
   */
  get tasks(): Array<Task<T>> {
    return [...this.values()].filter((task) => task !== null);
  }

  /**
   * Gets an array of the empty Timeslot objects in the Day object.
   * @param {boolean} extendToLimit - Whether to include empty Timeslot objects for the beginning and end of the Day object.
   * @returns {Array<Timeslot>} An array of the empty Timeslot objects in the Day object.
   */
  getEmptyTimeslots(extendToLimit = false): Array<Timeslot> {
    const timeslots = [...this.keys()];
    const emptyTimeslots = [];
    const sortedTimeslots = timeslots.sort((a, b) => Timeslot.fromString(a).compareTo(Timeslot.fromString(b)));
    for (let i = 0; i < sortedTimeslots.length; i++) {
      const currentTimeslot = sortedTimeslots[i];
      const nextTimeslot = sortedTimeslots[i + 1];
      if (nextTimeslot) {
        const emptyTimeslot = new Timeslot(
          Timeslot.fromString(currentTimeslot).end,
          Timeslot.fromString(nextTimeslot).start,
        );
        emptyTimeslots.push(emptyTimeslot);
      }
    }

    // Add empty timeslots for the beginning and the end
    if (extendToLimit) {
      const beginningTimeslot = new Timeslot(
        this._options.defaultStartLimit,
        Timeslot.fromString(sortedTimeslots[0]).start,
      );
      const endTimeslot = new Timeslot(
        Timeslot.fromString(sortedTimeslots[sortedTimeslots.length - 1]).end,
        this._options.defaultEndLimit,
      );
      emptyTimeslots.push(beginningTimeslot, endTimeslot);
    }

    return emptyTimeslots;
  }



  delete(key: string): boolean;
  delete(key: Timeslot): boolean;

  /**
   * Deletes the specified key from the Day.
   * @param {(Timeslot|string)} key - The key to delete.
   * @returns {boolean} - Returns true if the key was successfully deleted, or false if it did not exist.
   */
  delete(key: Timeslot | string): boolean {
    const timeslot = typeof key === 'string' ? key : Timeslot.toString();
    return super.delete(timeslot);
  }


  /**
   * Returns a string representation of the Day.
   * @param {DayToStringOptions} [options={}] - Options for formatting the output string.
   * @returns {string} - The string representation of the Day.
   */
  toString(options: DayToStringOptions = {}): string {
    const { includeDay = true } = options;
    if (!includeDay) {
      return this.timeslotSeries.toString();
    }
    return Day.formatString(this._dayOfWeek, this.timeslotSeries.toString());
  }

  /**
   * Returns a string representation of the day and timeslots.
   * @param {(DayType|number)} day - The day.
   * @param {string} timeslots - The string representation of the timeslots.
   * @returns {string} - The formatted string.
   */
  static formatString(day: DayType | number, timeslots: string): string {
    const dayIndex = typeof day === 'string' ? DayLabels.indexOf(day) : day;

    return `${dayIndex}${DAY_TIME_SEPARATOR}${timeslots}`;
  }

  /**
   Returns a Day instance from a given TimeslotSeries instance.
   @param {TimeslotSeries} value - The TimeslotSeries instance.
   @param {DayType} dayOfWeek - The day of the week.
   @returns {Day<unknown>} - The Day instance.
   */
  static fromTimeslotSeries(value: TimeslotSeries, dayOfWeek: DayType): Day<unknown> {
    return new Day({
      dayOfWeek,
      timeslots: value.toJSON().timeslots,
    });
  }

  /**
   * Returns a Day instance from a given string representation.
   * @param {string} value - The string representation of the Day.
   * @param {TimeslotSeriesOptions} [options] - Options for parsing the string.
   * @returns {Day<unknown>} - The Day instance.
   * @throws {WeekDataStructureError} - If the timeslots are outside the limits specified in the options.
   */
  static fromString(value: string, options?: TimeslotSeriesOptions): Day<unknown> {
    const [dayIndex, timeslotsRawString]: [string, string] = value.split(DAY_TIME_SEPARATOR) as unknown as [
      string,
      string,
    ];
    const dayOfWeek = dayIndex ? DayLabels[parseInt(dayIndex, 10)] : DayLabels[0];
    const timeslots = TimeslotSeries.fromString(timeslotsRawString);

    const finalOptions = options ?? this.getDefaultTimeslotSeriesOptions();

    Day.ensureTimeslotsAreInLimit(timeslots.toArray(), finalOptions);

    const serializedTimeslots = timeslots.toArray().map((timeslot) => timeslot.toJSON());

    return new Day(
      {
        dayOfWeek,
        timeslots: serializedTimeslots,
      },
      finalOptions,
    );
  }

  /**
   * Returns the default options for a TimeslotSeries.
   * @returns {TimeslotSeriesOptions} - The default options.
   */
  private static getDefaultTimeslotSeriesOptions(): TimeslotSeriesOptions {
    return {
      allowTimeslotMerging: true,
      defaultStartLimit: Time.fromString(DEFAULT_START_DAY_LIMIT),
      defaultEndLimit: Time.fromString(DEFAULT_END_DAY_LIMIT),
    };
  }


  /**
   * Ensures that all timeslots are within the specified start and end limits.
   * @param {Array<Timeslot>} timeslots - The array of timeslots.
   * @param {TimeslotSeriesOptions} options - The options that contain the start and end limits.
   * @throws {WeekDataStructureError} - If any timeslot is outside the limits specified in the options.
   */
  private static ensureTimeslotsAreInLimit(timeslots: Array<Timeslot>, options: TimeslotSeriesOptions): void {
    if (options.defaultStartLimit) {
      const timeslotsBeforeStartLimit = timeslots.filter((timeslot) =>
        timeslot.start.isBefore(options.defaultStartLimit),
      );
      if (timeslotsBeforeStartLimit.length > 0) {
        throw new WeekDataStructureError(
          `Timeslots ${timeslotsBeforeStartLimit} are before the start limit ${options.defaultStartLimit}`,
          'Day',
        );
      }
    }

    if (options.defaultEndLimit) {
      const timeslotsAfterEndLimit = timeslots.filter((timeslot) => timeslot.end.isAfter(options.defaultEndLimit));
      if (timeslotsAfterEndLimit.length > 0) {
        throw new WeekDataStructureError(
          `Timeslots ${timeslotsAfterEndLimit} are after the end limit ${options.defaultEndLimit}`,
          'Day',
        );
      }
    }
  }
}
