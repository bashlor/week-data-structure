import { Timeslot } from './timeslot';
import { compareRanges } from './util/timeslot.util';
import { TimeslotSerieSerializable } from './type/timeslot-series.type';
import { TIMESLOT_SERIES_SEPARATOR } from './constant/time.constant';
import { Time } from './time';
import { TimeslotSerializable, TimeslotSerieOptions } from './type/timeslot.type';
import { WeekManagerError } from './error/week-manager.error';
import { mapToTimeslotSerieTuple } from './util/timeslot-series.util';

export class TimeslotSerie extends Map<string, Timeslot> {
  private readonly _options: TimeslotSerieOptions;

  constructor(
    value?: TimeslotSerieSerializable | Map<string, Timeslot> | TimeslotSerie | null,
    options?: TimeslotSerieOptions,
  ) {
    if (value == null) {
      super();
      return;
    }

    if (value instanceof TimeslotSerie || value instanceof Map) {
      super(value.entries());
      return;
    }

    super(new Map(value.timeslots.map(mapToTimeslotSerieTuple)));

    if (options) {
      this._options = options;
      return;
    }
    this._options = TimeslotSerie.getDefaultTimeslotSerieOptions();
  }

  // Getters

  get first(): Timeslot {
    if (this.toArray().length === 0) {
      throw new WeekManagerError('Timeslot serie is empty', 'TimeslotSerie');
    }
    return this.toArray()[0];
  }

  get last(): Timeslot {
    if (this.toArray().length === 0) {
      throw new WeekManagerError('Timeslot serie is empty', 'TimeslotSerie');
    }
    return this.toArray()[this.toArray().length - 1];
  }

  // Static methods

  static fromArray(
    value:
      | string[]
      | Array<Timeslot>
      | TimeslotSerieSerializable
      | Array<TimeslotSerializable>
      | Array<string | Timeslot | TimeslotSerializable>,
    options?: TimeslotSerieOptions,
  ): TimeslotSerie {
    const mappedValues = Array.isArray(value)
      ? (value.map(mapToTimeslotSerieTuple as never) as unknown as readonly [string, Timeslot][])
      : value.timeslots.map(mapToTimeslotSerieTuple);

    return new TimeslotSerie(new Map(mappedValues), {
      ...TimeslotSerie.getDefaultTimeslotSerieOptions(),
      ...options,
    }) as TimeslotSerie;
  }

  static fromString<T>(value: string, data?: T, options?: TimeslotSerieOptions): TimeslotSerie {
    if (value.length === 0) {
      throw new WeekManagerError(value, 'Day');
    }

    const dayRangesRaw = value.split(TIMESLOT_SERIES_SEPARATOR);

    const ranges: Array<TimeslotSerializable> = dayRangesRaw
      .map((rangeRaw) => Timeslot.fromString(rangeRaw))
      .sort(compareRanges)
      .map((r) => r.toJSON());
    const timeslotSerie = new TimeslotSerie(
      { timeslots: ranges },
      options ?? TimeslotSerie.getDefaultTimeslotSerieOptions(),
    );

    return timeslotSerie;
  }

  private static timeSlotOrString(timeslot: string | Timeslot): string {
    return typeof timeslot === 'string' ? timeslot : timeslot.toString();
  }

  private static getDefaultTimeslotSerieOptions(): TimeslotSerieOptions {
    return {
      allowTimeslotMerging: true,
      defaultStartLimit: Time.fromString('00:00'),
      defaultEndLimit: Time.fromString('23:59'),
    };
  }

  // Methods

  equals(that: TimeslotSerie): boolean {
    return this.toString() === that.toString();
  }

  set(key: Timeslot | string): this {
    const timeslot = typeof key === 'string' ? Timeslot.fromString(key) : key;

    const timeslots = [...super.values()];

    const overlappedTimeslot = timeslots.find((savedTimeslot) => savedTimeslot.overlaps(timeslot));
    if (overlappedTimeslot) {
      throw new WeekManagerError(
        `Cannot add ${timeslot.toString()}, it overlaps with ${overlappedTimeslot.toString()}`,
        'TimeslotSerie',
      );
    }
    if (typeof key === 'string') {
      // logic based on string time slot
      return super.set(key, timeslot);
    }
    return super.set(key.toString(), timeslot);
  }

  getEmptyTimeslots(extendsToLimit = false): Timeslot[] {
    const timeslots = [...super.values()];
    const emptyTimeslots: Timeslot[] = [];
    const sortedTimeslots = timeslots.sort(compareRanges);
    for (let i = 0; i < sortedTimeslots.length; i++) {
      const currentTimeslot = sortedTimeslots[i];
      const nextTimeslot = sortedTimeslots[i + 1];
      if (nextTimeslot) {
        const emptyTimeslot = new Timeslot(currentTimeslot.end, nextTimeslot.start);
        emptyTimeslots.push(emptyTimeslot);
      }
    }

    // Add empty timeslots for the beginning and the end
    if (extendsToLimit) {
      const beginningTimeslot = new Timeslot(this._options.defaultStartLimit, sortedTimeslots[0].start);
      const endTimeslot = new Timeslot(sortedTimeslots[sortedTimeslots.length - 1].end, this._options.defaultEndLimit);
      emptyTimeslots.push(beginningTimeslot, endTimeslot);
    }

    return emptyTimeslots;
  }

  overlapsWith(timeslot: Timeslot | string): boolean {
    const timeslotToCheck = typeof timeslot === 'string' ? Timeslot.fromString(timeslot) : timeslot;
    const timeslots = [...super.values()];
    return timeslots.some((savedTimeslot) => savedTimeslot.overlaps(timeslotToCheck));
  }

  delete(timeslot: string | Timeslot): boolean {
    return super.delete(TimeslotSerie.timeSlotOrString(timeslot));
  }

  replace(replace: string | Timeslot, timeslot: string | Timeslot): this {
    const replaceString = TimeslotSerie.timeSlotOrString(replace);
    if (!this.has(replaceString) || this.has(timeslot.toString())) return this;
    this.delete(replaceString);
    return this.set(timeslot);
  }

  has(timeslot: Timeslot | string): boolean {
    return super.has(TimeslotSerie.timeSlotOrString(timeslot));
  }

  contains(value: Time | Timeslot): boolean;
  contains(value: Time | Timeslot, extract: true): Timeslot | null;
  contains(value: Time | Timeslot, extract: false): boolean;
  contains(value: Time | Timeslot, extract = false): boolean | Timeslot | null {
    if (extract) return this.toArray().find((r) => r.contains(value)) ?? null;
    return this.toArray().some((r) => r.contains(value));
  }

  toString(): string {
    return this.toArray()
      .map((range) => range.toString())
      .join(TIMESLOT_SERIES_SEPARATOR);
  }

  toLocalString(): string {
    return this.toArray()
      .map((range) => range.toLocaleString())
      .join(TIMESLOT_SERIES_SEPARATOR);
  }

  toDate(): Array<[Date, Date]> {
    return this.toArray().map((timeslot) => timeslot.toDate());
  }

  toJSON(): TimeslotSerieSerializable {
    return {
      timeslots: this.toArray().map((timeslot) => timeslot.toJSON()),
    };
  }

  toArray(): Array<Timeslot> {
    const array = [...this.values()];

    return array.sort(compareRanges);
  }
}
