import { TimeslotSerie } from './timeslot-serie';
import { DayType, DayLabels, DayTypeEnum } from './type/date.type';
import { Timeslot } from './timeslot';
import { Task } from './task';
import { DayParsable, DaySerializable, DayToStringOptions } from './type/day.type';
import { WeekManagerError } from './error/week-manager.error';
import { DAY_TIME_SEPARATOR, TIMESLOT_SERIES_SEPARATOR } from './constant/time.constant';
import { TimeslotSerieOptions } from './type/timeslot.type';
import { Time } from './time';

export class Day extends Map<string, Task | null> {
  private readonly _options: TimeslotSerieOptions;
  private readonly _dayOfWeek: DayType;

  constructor(value: DayTypeEnum, options?: TimeslotSerieOptions);
  constructor(value: DayType, options?: TimeslotSerieOptions);
  constructor(value: DayParsable, options?: TimeslotSerieOptions);
  constructor(value: Day, options?: TimeslotSerieOptions);
  constructor(value: Day | DayParsable | DayType | DayTypeEnum | null, options?: TimeslotSerieOptions) {
    if (value === null) {
      super();
      this._dayOfWeek = DayLabels[0];
      return;
    }

    if (
      Object.prototype.hasOwnProperty.call(value, 'dayOfWeek') &&
      Object.prototype.hasOwnProperty.call(value, 'timeslots')
    ) {
      const { dayOfWeek, timeslots } = (value as DayParsable) || {};
      const timeslotsEntries = timeslots
        .map((timeslot) => [new Timeslot(timeslot), null] as [Timeslot, Task | null])
        .map(([timeslot, task]) => [timeslot.toString(), task] as [string, Task | null]);
      super(timeslotsEntries);
      this._dayOfWeek = dayOfWeek;
      return;
    }

    if (value instanceof Day) {
      const timeslots = [...value.entries()];
      super(timeslots);
      this._dayOfWeek = value.day;
      return;
    }

    if (typeof value === 'number' && DayTypeEnum[value] !== undefined) {
      super();
      this._dayOfWeek = DayLabels[value];
      return;
    }

    super();
    this._options = options ?? Day.getDefaultTimeslotSerieOptions();
  }

  get day(): DayType {
    return this._dayOfWeek;
  }

  compareTo(that: Day): number {
    return DayLabels.indexOf(this.day) - DayLabels.indexOf(that.day);
  }

  isAfter(that: Day) {
    return this.compareTo(that) > 0;
  }

  equals(that: Day): boolean {
    return this.toString() === that.toString();
  }

  set(key: Timeslot | string, task: Task): this {
    const timeslot = typeof key === 'string' ? key : key.toString();
    super.set(timeslot, task);
    return this;
  }

  insert(key: string, task: Task): Timeslot;
  insert(key: Timeslot, task: Task): Timeslot;
  insert(key: Timeslot | string, task: Task): Timeslot {
    const timeslot = typeof key === 'string' ? Timeslot.fromString(key) : key;
    const timeslotAvailable = [...super.keys()].find(
      (t) => Timeslot.fromString(t).contains(timeslot) && super.get(t) === null,
    );
    if (!timeslotAvailable) {
      throw new WeekManagerError(`Cannot insert ${key}. There's no timeslots that can contain it.`, 'Day');
    }
    const deleteResult = this.delete(timeslotAvailable);
    if (!deleteResult) {
      throw new WeekManagerError(
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

  get tasks(): Array<Task> {
    return [...this.values()].filter((task) => task !== null);
  }

  empty(extendToLimit = false): Array<Timeslot> {
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
      return this.toString();
    }
    return Day.formatString(
      this._dayOfWeek,
      [...super.keys()].map((task) => task.toString()).join(TIMESLOT_SERIES_SEPARATOR),
    );
  }

  static formatString(day: DayType | number, timeslots: string): string {
    const dayIndex = typeof day === 'string' ? DayLabels.indexOf(day) : day;

    return `${dayIndex}${DAY_TIME_SEPARATOR}${timeslots}`;
  }

  static fromTimeslotSerie(value: TimeslotSerie, dayOfWeek: DayType): Day {
    return new Day({
      dayOfWeek,
      timeslots: value.toJSON().timeslots,
    });
  }

  static fromString(value: string): Day {
    const [dayIndex, timeslotsRawString]: [string, string] = value.split(DAY_TIME_SEPARATOR) as unknown as [
      string,
      string,
    ];
    const dayOfWeek = dayIndex ? DayLabels[parseInt(dayIndex, 10)] : DayLabels[0];
    const timeslots = TimeslotSerie.fromString(timeslotsRawString).toJSON().timeslots;
    return new Day({
      dayOfWeek,
      timeslots,
    });
  }

  private static getDefaultTimeslotSerieOptions(): TimeslotSerieOptions {
    return {
      allowTimeslotMerging: true,
      defaultStartLimit: Time.fromString('07:00'),
      defaultEndLimit: Time.fromString('20:00'),
    };
  }
}
