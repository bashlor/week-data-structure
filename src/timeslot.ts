import { Time } from './time';
import { INTERVAL_TIME_SEPARATOR } from './constant/time.constant';
import { WeekManagerError } from './error/week-manager.error';
import { TimeslotSerializable } from './type/timeslot.type';

export class Timeslot {
  private readonly _start: Time;
  private readonly _end: Time;

  constructor(value: [Time, Time]);
  constructor(start: Time, end: Time);
  constructor(value: TimeslotSerializable);
  constructor(value: Timeslot);
  constructor(valueOrStart: [Time, Time] | TimeslotSerializable | Timeslot | Time, valueEnd?: Time) {
    const rangeError = new WeekManagerError(`Invalid Timeslot tuple, start cannot be after end.`, 'Timeslot');

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

  get start(): Time {
    return this._start;
  }

  get end(): Time {
    return this._end;
  }

  get duration(): number {
    const hours = this._end.hours - this._start.hours;
    const minutes = this._end.minutes - this._start.minutes;
    return hours * 60 + minutes;
  }

  static fromString(value: string): Timeslot {
    const rawTime = value.split(INTERVAL_TIME_SEPARATOR);
    if (rawTime.length !== 2) {
      throw new WeekManagerError(value, 'Timeslot');
    }
    const [startRaw, endRaw] = rawTime;

    const start = Time.fromString(startRaw);
    const end = Time.fromString(endRaw);

    if (start.isAfter(end)) throw new WeekManagerError(value, 'Timeslot');
    return new Timeslot({ start: start.toJSON(), end: end.toJSON() });
  }

  static numberOfSlotsInRange(range: Timeslot, timeSlot: number): number {
    if (timeSlot % 5 !== 0 || range.duration % 5 !== 0 || timeSlot >= range.duration) return 0;
    return range.duration / timeSlot;
  }

  toDate(from: Date = new Date()): [Date, Date] {
    return [this._start.toDate(from), this._end.toDate(from)];
  }

  private formatString(start: string, end: string): string {
    return `${start}${INTERVAL_TIME_SEPARATOR}${end}`;
  }

  toString(): string {
    return this.formatString(this._start.toString(), this._end.toString());
  }

  toLocaleString(): string {
    return this.formatString(this._start.toLocaleString(), this._end.toLocaleString());
  }

  toJSON(): TimeslotSerializable {
    return { end: this._end.toJSON(), start: this._start.toJSON() };
  }

  equals(that: Timeslot): boolean {
    return this.compareTo(that) === 0;
  }

  compareTo(that: Timeslot): number {
    const start = this._start.compareTo(that._start);
    const end = this._end.compareTo(that._end);

    if (start > 0) return 1;
    if (start < 0) return -1;

    if (end > 0) return 1;
    if (end < 0) return -1;

    return 0;
  }

  isAfter(that: Timeslot, strict?: boolean): boolean {
    if (strict === true || typeof strict === 'undefined') return this.compareTo(that) > 0;
    return this.compareTo(that) >= 0;
  }

  isBefore(that: Timeslot, strict?: boolean): boolean {
    if (strict === true || typeof strict === 'undefined') return this.compareTo(that) < 0;
    return this.compareTo(that) <= 0;
  }

  contains(that: Time | Timeslot): boolean {
    if (that instanceof Time) {
      return that.compareTo(this._start) >= 0 && that.compareTo(this._end) <= 0;
    }

    return this._start.compareTo(that._start) <= 0 && this._end.compareTo(that._end) >= 0;
  }

  overlaps(that: Timeslot): boolean {
    return this._start.compareTo(that._end) < 0 && this._end.compareTo(that._start) > 0;
  }

  static mergeTimeslotIntersection(container: Timeslot, timeslot: Timeslot): [Timeslot, Timeslot[]] {
    if (!container.overlaps(timeslot))
      throw new WeekManagerError(`Cannot merge timeslots that do not overlap.`, 'Timeslot');

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
