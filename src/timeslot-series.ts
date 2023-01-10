import { Timeslot } from './timeslot';
import { compareRanges } from './util/timeslot.util';
import { TimeslotSeriesSerializable } from './type/timeslot-series.type';
import { TIMESLOT_SERIES_SEPARATOR } from './constant/time.constant';
import { Time } from './time';
import { TimeslotSerializable, TimeslotSeriesOptions } from './type/timeslot.type';
import { WeekDataStructureError } from './error/week-data-structure.error';
import { mapToTimeslotSerieTuple } from './util/timeslot-series.util';

/**
 * Represents a series of consecutive time slots, which can be merged or split.
 * @extends {Map<string, Timeslot>}
 */
export class TimeslotSeries extends Map<string, Timeslot> {
  private readonly _options: TimeslotSeriesOptions;

  /**
   * @param {TimeslotSeriesSerializable | Map<string, Timeslot> | TimeslotSeries | null} [value]
   * @param {TimeslotSeriesOptions} [options]
   **/
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

  /**
   * Returns the first timeslot in the series.
   * @throws {WeekDataStructureError} When the series is empty
   * @returns {Timeslot}
   */
  get first(): Timeslot {
    if (this.toArray().length === 0) {
      throw new WeekDataStructureError('Timeslot series is empty', 'TimeslotSeries');
    }
    return this.toArray()[0];
  }

  /**
   * Returns the last timeslot in the series.
   * @throws {WeekDataStructureError} When the series is empty
   * @returns {Timeslot}
   */
  get last(): Timeslot {
    if (this.toArray().length === 0) {
      throw new WeekDataStructureError('Timeslot series is empty', 'TimeslotSeries');
    }
    return this.toArray()[this.toArray().length - 1];
  }

  /**
   * Returns a new TimeslotSeries instance created from an array of strings or Timeslots.
   * @param {string[] | Array<Timeslot> | TimeslotSeriesSerializable | Array<TimeslotSerializable> | Array<string | Timeslot | TimeslotSerializable>} value
   * @param {TimeslotSeriesOptions} [options]
   * @returns {TimeslotSeries}
   */
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

  /**
   * Static method that creates a new TimeslotSeries instance from a string value.
   * @param value - String value to be converted into a TimeslotSeries instance
   * @param data - Optional data to be included in the TimeslotSeries instance
   * @param options - Optional TimeslotSeriesOptions object to configure the instance
   * @returns A new TimeslotSeries instance
   * @throws {WeekDataStructureError} If the string value is empty
   * @throws {WeekDataStructureError} If some values in the TimeslotSeries overlap
   */
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

  /**
   * Returns the input timeslot as a string. If the input is a string, it is returned as-is.
   * If the input is a Timeslot, its toString() method is called and the result is returned.
   * @param timeslot - The timeslot to convert to a string
   * @returns A string representation of the input timeslot
   */
  private static timeSlotOrString(timeslot: string | Timeslot): string {
    return typeof timeslot === 'string' ? timeslot : timeslot.toString();
  }



  /**
   * Returns the default options for a TimeslotSeries instance.
   * @returns The default options for a TimeslotSeries
   */
  private static getDefaultTimeslotSeriesOptions(): TimeslotSeriesOptions {
    return {
      allowTimeslotMerging: true,
      defaultStartLimit: Time.fromString('00:00'),
      defaultEndLimit: Time.fromString('23:59'),
      enforceOverlappingCheck: false,
    };
  }

  /**
   * Determine if the current TimeslotSeries is equal to the provided TimeslotSeries.
   * @param {TimeslotSeries} that - The TimeslotSeries to compare against.
   * @returns {boolean} - A boolean indicating if the two TimeslotSeries are equal.
   */
  equals(that: TimeslotSeries): boolean {
    return this.toString() === that.toString();
  }

  /**
   * Add a Timeslot to the TimeslotSeries.
   * @param {Timeslot | string} key - The Timeslot or string representation of the Timeslot to add.
   * @returns {this} - The current TimeslotSeries instance.
   * @throws {WeekDataStructureError} If the Timeslot overlaps with an existing Timeslot and enforceOverlappingCheck is enabled in options.
   */
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

  /**
   * Get an array of empty Timeslots within the current TimeslotSeries.
   * @param {boolean} [extendsToLimit=false] - If set to true, will include Timeslots for the beginning and end of the current TimeslotSeries.
   * @returns {Timeslot[]} - An array of empty Timeslots within the current TimeslotSeries.
   */
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

  /**
   * Check if the provided timeslot overlaps with any timeslot in this series
   * @param timeslot - The timeslot to check
   * @returns A boolean indicating whether the provided timeslot overlaps with any timeslot in this series
   */
  overlapsWith(timeslot: Timeslot | string): boolean {
    const timeslotToCheck = typeof timeslot === 'string' ? Timeslot.fromString(timeslot) : timeslot;
    const timeslots = [...super.values()];
    return timeslots.some((savedTimeslot) => savedTimeslot.overlaps(timeslotToCheck));
  }

  /**
   * Remove a timeslot from this series
   * @param timeslot - The timeslot to remove
   * @returns A boolean indicating whether the timeslot was found and removed
   */
  delete(timeslot: string | Timeslot): boolean {
    return super.delete(TimeslotSeries.timeSlotOrString(timeslot));
  }

  /**
   * Replace a timeslot with another in this series
   * @param replace - The timeslot to replace
   * @param timeslot - The timeslot to replace with
   * @returns This object for chaining
   */
  replace(replace: string | Timeslot, timeslot: string | Timeslot): this {
    const replaceString = TimeslotSeries.timeSlotOrString(replace);
    if (!this.has(replaceString) || this.has(timeslot.toString())) return this;
    this.delete(replaceString);
    return this.set(timeslot);
  }

  /**
   * Check if this series contains a specific timeslot
   * @param timeslot - The timeslot to check for
   * @returns A boolean indicating whether this series contains the provided timeslot
   */
  has(timeslot: Timeslot | string): boolean {
    return super.has(TimeslotSeries.timeSlotOrString(timeslot));
  }

  contains(value: Time | Timeslot): boolean;
  contains(value: Time | Timeslot, extract: true): Timeslot | null;
  contains(value: Time | Timeslot, extract: false): boolean;

  /**
   * Returns whether the given value is contained within the timeslots in this series.
   * If extract is true, returns the first matching timeslot that contains the value, or null if none exists.
   * If extract is false (the default), returns a boolean indicating whether at least one timeslot in this series contains the value.
   * @param value The Time or Timeslot to check for containment within this series.
   * @param extract Whether to return the first matching timeslot that contains the value (if true) or a boolean indicating whether at least one timeslot in this series contains the value (if false). Defaults to false.
   * @returns If extract is true, returns the first matching timeslot that contains the value, or null if none exists. If extract is false (the default), returns a boolean indicating whether at least one timeslot in this series contains the value.
   */
  contains(value: Time | Timeslot, extract = false): boolean | Timeslot | null {
    if (extract) return this.toArray().find((r) => r.contains(value)) ?? null;
    return this.toArray().some((r) => r.contains(value));
  }

  /**
   * Returns the string representation of this TimeslotSeries.
   * The string representation is a list of timeslots separated by a `,` string.
   *
   * @return {string} The string representation of this TimeslotSeries.
   */
  toString(): string {
    return this.toArray()
      .map((range) => range.toString())
      .join(TIMESLOT_SERIES_SEPARATOR);
  }

  /**
   * Returns the localized string representation of this TimeslotSeries.
   * The string representation is a list of timeslots separated by a `,` string.
   *
   * @return {string} The localized string representation of this TimeslotSeries.
   */
  toLocalString(): string {
    return this.toArray()
      .map((range) => range.toLocaleString())
      .join(TIMESLOT_SERIES_SEPARATOR);
  }

  /**
   * Returns an array of tuples with the start and end dates of this TimeslotSeries.
   *
   * @return {Array<[Date, Date]>} An array of tuples with the start and end dates of this TimeslotSeries.
   */
  toDate(): Array<[Date, Date]> {
    return this.toArray().map((timeslot) => timeslot.toDate());
  }

  /**
   * Returns a serializable object for this TimeslotSeries.
   *
   * @return {TimeslotSeriesSerializable} A serializable object for this TimeslotSeries.
   */
  toJSON(): TimeslotSeriesSerializable {
    return {
      timeslots: this.toArray().map((timeslot) => timeslot.toJSON()),
    };
  }

  /**
   * Returns an array of Timeslot objects contained in this TimeslotSeries.
   *
   * @return {Array<Timeslot>} An array of Timeslot objects contained in this TimeslotSeries.
   */
  toArray(): Array<Timeslot> {
    const array = [...this.values()];

    return array.sort(compareRanges);
  }
}
