import { Timeslot } from './timeslot';
import { compareRanges } from './util/timeslot.util';
import { TimeslotSeriesSerializable } from './type/timeslot-series.type';
import { TIMESLOT_SERIES_SEPARATOR } from './constant/time.constant';
import { Time } from './time';
import { TimeslotSerializable, TimeslotSeriesOptions } from './type/timeslot.type';
import { WeekDataStructureError } from './error/week-data-structure.error';
import { mapToTimeslotSerieTuple } from './util/timeslot-series.util';

export class TimeslotSeries extends Map<string, Timeslot> {
  private readonly _options: TimeslotSeriesOptions;

  constructor(
    value?: TimeslotSeriesSerializable | Map<string, Timeslot> | TimeslotSeries | null,
    options?: TimeslotSeriesOptions,
  ) {
    if (value == null) {
      super();
      return;
    }

    if (value instanceof TimeslotSeries || value instanceof Map) {
      super(value.entries());
      return;
    }

    super(new Map(value.timeslots.map(mapToTimeslotSerieTuple)));

    if (options) {
      this._options = options;
      return;
    }
    this._options = TimeslotSeries.getDefaultTimeslotSeriesOptions();
  }

  // Getters

  get first(): Timeslot {
    if (this.toArray().length === 0) {
      throw new WeekDataStructureError('Timeslot series is empty', 'TimeslotSeries');
    }
    return this.toArray()[0];
  }

  get last(): Timeslot {
    if (this.toArray().length === 0) {
      throw new WeekDataStructureError('Timeslot series is empty', 'TimeslotSeries');
    }
    return this.toArray()[this.toArray().length - 1];
  }

  // Static methods

  static fromArray(
    value:
      | string[]
      | Array<Timeslot>
      | TimeslotSeriesSerializable
      | Array<TimeslotSerializable>
      | Array<string | Timeslot | TimeslotSerializable>,
    options?: TimeslotSeriesOptions,
  ): TimeslotSeries {
    const mappedValues = Array.isArray(value)
      ? (value.map(mapToTimeslotSerieTuple as never) as unknown as readonly [string, Timeslot][])
      : value.timeslots.map(mapToTimeslotSerieTuple);

    return new TimeslotSeries(new Map(mappedValues), {
      ...TimeslotSeries.getDefaultTimeslotSeriesOptions(),
      ...options,
    }) as TimeslotSeries;
  }

  static fromString<T>(value: string, data?: T, options?: TimeslotSeriesOptions): TimeslotSeries {
    if (value.length === 0) {
      throw new WeekDataStructureError(value, 'Day');
    }

    const dayRangesRaw = value.split(TIMESLOT_SERIES_SEPARATOR);

    const ranges: Array<Timeslot> = dayRangesRaw.map((rangeRaw) => Timeslot.fromString(rangeRaw));

    const someRangeOverlaps = ranges.some((range, index) => {
      const otherRanges = ranges.slice(index + 1);
      return otherRanges.some((otherRange) => otherRange.overlaps(range));
    });

    if (someRangeOverlaps) {
      throw new WeekDataStructureError(
        'Failed to create TimeslotSeries from string. Some values are overlapping.',
        'TimeslotSeries',
      );
    }

    ranges.sort(compareRanges).map((r) => r.toJSON());
    return new TimeslotSeries({ timeslots: ranges }, options ?? TimeslotSeries.getDefaultTimeslotSeriesOptions());
  }

  private static timeSlotOrString(timeslot: string | Timeslot): string {
    return typeof timeslot === 'string' ? timeslot : timeslot.toString();
  }

  private static getDefaultTimeslotSeriesOptions(): TimeslotSeriesOptions {
    return {
      allowTimeslotMerging: true,
      defaultStartLimit: Time.fromString('00:00'),
      defaultEndLimit: Time.fromString('23:59'),
      enforceOverlappingCheck: false,
    };
  }

  // Methods

  equals(that: TimeslotSeries): boolean {
    return this.toString() === that.toString();
  }

  set(key: Timeslot | string): this {
    const timeslot = typeof key === 'string' ? Timeslot.fromString(key) : key;

    const timeslots = [...super.values()];

    if (this._options?.enforceOverlappingCheck) {
      const overlappedTimeslot = timeslots.find((savedTimeslot) => savedTimeslot.overlaps(timeslot));

      throw new WeekDataStructureError(
        `Cannot add ${timeslot.toString()}, it overlaps with ${overlappedTimeslot.toString()}`,
        'TimeslotSeries',
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
    return super.delete(TimeslotSeries.timeSlotOrString(timeslot));
  }

  replace(replace: string | Timeslot, timeslot: string | Timeslot): this {
    const replaceString = TimeslotSeries.timeSlotOrString(replace);
    if (!this.has(replaceString) || this.has(timeslot.toString())) return this;
    this.delete(replaceString);
    return this.set(timeslot);
  }

  has(timeslot: Timeslot | string): boolean {
    return super.has(TimeslotSeries.timeSlotOrString(timeslot));
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

  toJSON(): TimeslotSeriesSerializable {
    return {
      timeslots: this.toArray().map((timeslot) => timeslot.toJSON()),
    };
  }

  toArray(): Array<Timeslot> {
    const array = [...this.values()];

    return array.sort(compareRanges);
  }
}
