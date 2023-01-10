import { Time } from './time';
import { INTERVAL_TIME_SEPARATOR } from './constant/time.constant';
import { WeekDataStructureError } from './error/week-data-structure.error';
import { TimeslotSerializable } from './type/timeslot.type';

/**
 * The Timeslot class represents a range of time between a start and end Time.
 * The Timeslot class includes methods for getting the start and end Time,
 * for getting the duration of the Timeslot, for converting the Timeslot to a serialized object,
 * and for comparing Timeslots.
 */
export class Timeslot {
  private readonly _start: Time;
  private readonly _end: Time;

  /**
   * Constructs a new Timeslot object with the specified start and end Time.
   * @param value The start and end Time of the Timeslot as a tuple.
   */
  constructor(value: [Time, Time]);
  /**
   * Constructs a new Timeslot object with the specified start and end Time.
   * @param start The start Time of the Timeslot.
   * @param end The end Time of the Timeslot.
   */
  constructor(start: Time, end: Time);
  /**
   * Constructs a new Timeslot object from the provided serialized Timeslot object.
   * @param value The serialized Timeslot object.
   */
  constructor(value: TimeslotSerializable);
  /**
   * Constructs a new Timeslot object from the provided Timeslot object.
   * @param value The Timeslot object to copy.
   */
  constructor(value: Timeslot);

  /**
  * Constructs a new Timeslot object with the specified start and end Time.
  * @param valueOrStart The start and end Time of the Timeslot as a tuple,
  *                     the start Time of the Timeslot,
  *                     the serialized Timeslot object,
  *                     or the Timeslot object to copy.
  * @param valueEnd The end Time of the Timeslot, if the start Time is specified as a parameter.
  */
  constructor(valueOrStart: [Time, Time] | TimeslotSerializable | Timeslot | Time, valueEnd?: Time) {
    const rangeError = new WeekDataStructureError(`Invalid Timeslot tuple, start cannot be after end.`, 'Timeslot');

    if (valueOrStart instanceof Timeslot) {
      this._start = valueOrStart._start;
      this._end = valueOrStart._end;
      return;
    }

    if (valueOrStart instanceof Time) {
      const end = valueEnd ?? valueOrStart.add(5);

      if (valueOrStart.isAfter(end)) throw rangeError;

      this._start = valueOrStart;
      this._end = end;
      return;
    }

    if (Array.isArray(valueOrStart)) {
      const [start, end] = valueOrStart;

      if (start.isAfter(end)) throw rangeError;

      this._start = start;
      this._end = end;
      return;
    }

    const { start, end } = valueOrStart;

    this._start = new Time(start);
    this._end = new Time(end);
  }

  /**
   * Returns the start Time of the Timeslot.
   * @returns The start Time of the Timeslot.
   */
  get start(): Time {
    return this._start;
  }

  /**
   * Returns the end Time of the Timeslot.
   * @returns The end Time of the Timeslot.
   */
  get end(): Time {
    return this._end;
  }

  /**
   * Returns the duration of the Timeslot in minutes.
   * @returns The duration of the Timeslot in minutes.
   */
  get duration(): number {
    const hours = this._end.hours - this._start.hours;
    const minutes = this._end.minutes - this._start.minutes;
    return hours * 60 + minutes;
  }

  /**
 * Returns a new Timeslot object parsed from the provided string.
 * @param value The string representation of the Timeslot.
 * @returns A new Timeslot object parsed from the provided string.
 */
  static fromString(value: string): Timeslot {
    const rawTime = value.split(INTERVAL_TIME_SEPARATOR);
    if (rawTime.length !== 2) {
      throw new WeekDataStructureError(value, 'Timeslot');
    }
    const [startRaw, endRaw] = rawTime;

    const start = Time.fromString(startRaw);
    const end = Time.fromString(endRaw);

    if (start.isAfter(end)) throw new WeekDataStructureError(value, 'Timeslot');
    return new Timeslot({ start: start.toJSON(), end: end.toJSON() });
  }

  /**
   * Returns the number of Timeslots of the specified duration that fit in the provided Timeslot.
   * @param range The Timeslot in which to fit the number of Timeslots.
   * @param timeSlot The duration of the Timeslots to fit in the range.
   * @returns The number of Timeslots of the specified duration that fit in the provided Timeslot.
   */
  static numberOfSlotsInRange(range: Timeslot, timeSlot: number): number {
    if (timeSlot % 5 !== 0 || range.duration % 5 !== 0 || timeSlot >= range.duration) return 0;
    return range.duration / timeSlot;
  }

  /**
   * Returns the start and end dates of the Timeslot, based on the provided date.
   * @param from The date from which to calculate the start and end dates of the Timeslot.
   * @returns The start and end dates of the Timeslot.
   */
  toDate(from: Date = new Date()): [Date, Date] {
    return [this._start.toDate(from), this._end.toDate(from)];
  }

  /**
   * Returns a formatted string representation of the Timeslot.
   * @param start The start Time string.
   * @param end The end Time string.
   * @returns A formatted string representation of the Timeslot.
   */
  private formatString(start: string, end: string): string {
    return `${start}${INTERVAL_TIME_SEPARATOR}${end}`;
  }

  /**
   * Returns a string representation of this Timeslot in the format "HH:MM-HH:MM".
   * @returns The string representation of this Timeslot.
   */
  toString(): string {
    return this.formatString(this._start.toString(), this._end.toString());
  }

  /**
   * Returns a string representation of this Timeslot in the local time zone, in the format "HH:MM-HH:MM".
   * @returns The string representation of this Timeslot.
   */
  toLocaleString(): string {
    return this.formatString(this._start.toLocaleString(), this._end.toLocaleString());
  }

  /**
   * Returns a serializable object representing this Timeslot.
   * @returns The serializable object representing this Timeslot.
   */
  toJSON(): TimeslotSerializable {
    return { end: this._end.toJSON(), start: this._start.toJSON() };
  }

  /**
   * Returns whether this Timeslot is equal to the provided Timeslot.
   * @param that The Timeslot to compare to.
   * @returns Whether this Timeslot is equal to the provided Timeslot.
   */
  equals(that: Timeslot): boolean {
    return this.compareTo(that) === 0;
  }

  /**
   * @param that The Timeslot to compare to.
   * @returns A negative number if this Timeslot is before the provided Timeslot,
   *          a positive number if this Timeslot is after the provided Timeslot,
   *          or 0 if the Timeslots are equal.
   */
  compareTo(that: Timeslot): number {
    const start = this._start.compareTo(that._start);
    const end = this._end.compareTo(that._end);

    if (start > 0) return 1;
    if (start < 0) return -1;

    if (end > 0) return 1;
    if (end < 0) return -1;

    return 0;
  }

  /**
   * Returns whether this Timeslot is after the provided Timeslot.
   * @param that The Timeslot to compare to.
   * @param strict If true, the Timeslots are considered to be after only if they start strictly after the provided Timeslot.
   * @returns Whether this Timeslot is after the provided Timeslot.
   */
  isAfter(that: Timeslot, strict?: boolean): boolean {
    if (strict === true || typeof strict === 'undefined') return this.compareTo(that) > 0;
    return this.compareTo(that) >= 0;
  }

  /**
   * Returns whether this Timeslot is before the provided Timeslot.
   * @param that The Timeslot to compare to.
   * @param strict If true, the Timeslots are considered to be before only if they start strictly before the provided Timeslot.
   * @returns Whether this Timeslot is before the provided Timeslot.
   */
  isBefore(that: Timeslot, strict?: boolean): boolean {
    if (strict === true || typeof strict === 'undefined') return this.compareTo(that) < 0;
    return this.compareTo(that) <= 0;
  }

  /**
   * Returns whether this Timeslot contains the provided Time or Timeslot.
   * @param that The Time or Timeslot to check.
   * @returns Whether this Timeslot contains the provided Time or Timeslot.
   */
  contains(that: Time | Timeslot): boolean {
    if (that instanceof Time) {
      return that.compareTo(this._start) >= 0 && that.compareTo(this._end) <= 0;
    }

    return this._start.compareTo(that._start) <= 0 && this._end.compareTo(that._end) >= 0;
  }

  /**
   * Returns whether this Timeslot overlaps the provided Timeslot.
   * @param that The Timeslot to check.
   * @returns Whether this Timeslot overlaps the provided Timeslot.
   */
  overlaps(that: Timeslot): boolean {
    return this._start.compareTo(that._end) < 0 && this._end.compareTo(that._start) > 0;
  }

  /**
   * Returns the merged Timeslot and the remaining Timeslots after merging the provided Timeslot with this Timeslot.
   * The merge will only be performed if the two Timeslots overlap.
   * @param container The Timeslot to merge with.
   * @param timeslot The Timeslot to merge.
   * @returns The merged Timeslot and the remaining Timeslots.
   * @throws {WeekDataStructureError} If the two Timeslots do not overlap.
   */
  static mergeTimeslotIntersection(container: Timeslot, timeslot: Timeslot): [Timeslot, Timeslot[]] {
    if (!container.overlaps(timeslot))
      throw new WeekDataStructureError(`Cannot merge timeslots that do not overlap.`, 'Timeslot');

    if (container.contains(timeslot) || timeslot.contains(container)) {
      const containedTimeslot = container.contains(timeslot) ? timeslot : container;
      const containerTimeslot = container.contains(timeslot) ? container : timeslot;
      const results: [Timeslot, Timeslot[]] = [containedTimeslot, []];

      const before = new Timeslot({ start: containerTimeslot.start, end: containedTimeslot.start });
      const after = new Timeslot({ start: containedTimeslot.end, end: containerTimeslot.end });

      if (before.duration > 0) results[1].push(before);
      if (after.duration > 0) results[1].push(after);
      return results;
    }

    const mergedTimeslot = new Timeslot({ start: timeslot.start, end: timeslot.end });

    const result: [Timeslot, Timeslot[]] = [mergedTimeslot, []];

    if (timeslot.start.isAfter(container.start)) {
      result[1].push(new Timeslot({ start: container.end, end: timeslot.end }));
    }
    if (timeslot.end.isBefore(container.end)) {
      result[1].push(new Timeslot({ start: timeslot.start, end: container.start }));
    }
    return result as [Timeslot, Timeslot[]];
  }

  /**
   * Splits the given timeslot into multiple timeslots based on the provided time limits.
   * @param timeslot - The timeslot to be split.
   * @param timeLimits - The time limits to split the timeslot on.
   * @returns An array of timeslots resulting from the split.
   */
  static split(timeslot: Timeslot, timeLimits: Time[]): Timeslot[] {
    const result: Timeslot[] = [];
    const times = [...timeLimits, timeslot.end];
    times.reduce((acc, curr) => {
      result.push(new Timeslot({ start: acc, end: curr }));
      return curr;
    }, timeslot.start);
    return result;
  }
}
