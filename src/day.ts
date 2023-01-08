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

export class Day<T> extends Map<string, Task<T> | null> {
  private readonly _options: TimeslotSeriesOptions;
  private readonly _dayOfWeek: DayType;

  constructor(value: DayTypeEnum, options?: TimeslotSeriesOptions);
  constructor(value: DayType, options?: TimeslotSeriesOptions);
  constructor(value: DayParsable, options?: TimeslotSeriesOptions);
  constructor(value: Day<T>, options?: TimeslotSeriesOptions);
  constructor(value?: undefined, options?: TimeslotSeriesOptions);
  constructor(value: Day<T> | DayParsable | DayType | DayTypeEnum | null | undefined, options?: TimeslotSeriesOptions) {
    if (value === null || typeof value === 'undefined') {
      super();
      this._dayOfWeek = DayLabels[0];
      this._options = options ?? Day.getDefaultTimeslotSerieOptions();
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
      this._options = options ?? Day.getDefaultTimeslotSerieOptions();
      return;
    }

    if (value instanceof Day) {
      const timeslots = [...value.entries()];
      super(timeslots);
      this._dayOfWeek = value.day;
      this._options = options ?? Day.getDefaultTimeslotSerieOptions();
      return;
    }

    if (typeof value === 'number' && DayTypeEnum[value] !== undefined) {
      super();
      this._dayOfWeek = DayLabels[value];
      this._options = options ?? Day.getDefaultTimeslotSerieOptions();
      return;
    }

    super();
    this._options = options ?? Day.getDefaultTimeslotSerieOptions();
  }

  get day(): DayType {
    return this._dayOfWeek;
  }

  get specs(): TimeslotSeriesOptions {
    return this._options;
  }
  get timeslots(): Timeslot[] {
    return [...super.keys()].map((timeslot) => Timeslot.fromString(timeslot));
  }

  get timeslotSeries(): TimeslotSeries {
    return TimeslotSeries.fromArray(this.timeslots, this._options);
  }

  compareTo(that: Day<T>): number {
    return DayLabels.indexOf(this.day) - DayLabels.indexOf(that.day);
  }

  isAfter(that: Day<T>) {
    return this.compareTo(that) > 0;
  }

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

  set(key: Timeslot | string, task: Task<T>): this {
    const timeslot = typeof key === 'string' ? key : key.toString();
    super.set(timeslot, task);
    return this;
  }

  insert(key: string, task: Task<T>): Timeslot;
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

  toJSON(): DaySerializable {
    return {
      dayOfWeek: this._dayOfWeek,
      timeslots: [...super.keys()].map((timeslot) => Timeslot.fromString(timeslot).toJSON()),
    };
  }

  get tasks(): Array<Task<T>> {
    return [...this.values()].filter((task) => task !== null);
  }

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
  delete(key: Timeslot | string): boolean {
    const timeslot = typeof key === 'string' ? key : Timeslot.toString();
    return super.delete(timeslot);
  }

  toString(options: DayToStringOptions = {}): string {
    const { includeDay = true } = options;
    if (!includeDay) {
      return this.timeslotSeries.toString();
    }
    return Day.formatString(this._dayOfWeek, this.timeslotSeries.toString());
  }

  static formatString(day: DayType | number, timeslots: string): string {
    const dayIndex = typeof day === 'string' ? DayLabels.indexOf(day) : day;

    return `${dayIndex}${DAY_TIME_SEPARATOR}${timeslots}`;
  }

  static fromTimeslotSeries(value: TimeslotSeries, dayOfWeek: DayType): Day<unknown> {
    return new Day({
      dayOfWeek,
      timeslots: value.toJSON().timeslots,
    });
  }

  static fromString(value: string, options?: TimeslotSeriesOptions): Day<unknown> {
    const [dayIndex, timeslotsRawString]: [string, string] = value.split(DAY_TIME_SEPARATOR) as unknown as [
      string,
      string,
    ];
    const dayOfWeek = dayIndex ? DayLabels[parseInt(dayIndex, 10)] : DayLabels[0];
    const timeslots = TimeslotSeries.fromString(timeslotsRawString);

    const finalOptions = options ?? this.getDefaultTimeslotSerieOptions();

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

  private static getDefaultTimeslotSerieOptions(): TimeslotSeriesOptions {
    return {
      allowTimeslotMerging: true,
      defaultStartLimit: Time.fromString(DEFAULT_START_DAY_LIMIT),
      defaultEndLimit: Time.fromString(DEFAULT_END_DAY_LIMIT),
    };
  }

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
