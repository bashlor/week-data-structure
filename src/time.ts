import { computeMinutes, totalMinutesToTimeHours, totalMinutesToTimeMinutes } from './util/time.util';
import { MINUTES_DAY, TIME_SEPARATOR } from './constant/time.constant';
import { TimeSerializable } from './type/time.type';
import { WeekDataStructureError } from './error/week-data-structure.error';
import { parseIntegerOrThrow } from './util/function.util';

export class Time {
  private readonly globalMinutes: number;

  constructor();
  constructor(hours: number, minutes?: number);
  constructor(value: TimeSerializable);
  constructor(value: Time);
  constructor(value: Date);
  constructor(valueOrHours?: number | TimeSerializable | Time | Date, minutes?: number) {
    if (valueOrHours == null) {
      const now = new Date();
      this.globalMinutes = computeMinutes(now.getHours(), now.getMinutes());
      return;
    }

    if (valueOrHours instanceof Date) {
      this.globalMinutes = computeMinutes(valueOrHours.getHours(), valueOrHours.getMinutes());
      return;
    }

    if (valueOrHours instanceof Time) {
      this.globalMinutes = valueOrHours.globalMinutes;
      return;
    }

    if (typeof valueOrHours === 'number') {
      this.globalMinutes = computeMinutes(valueOrHours, minutes ?? 0);
      return;
    }

    this.globalMinutes = computeMinutes(valueOrHours.hours, valueOrHours.minutes);
  }

  toString(): string {
    const { hours, minutes } = this;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  toDate(from: Date = new Date()): Date {
    return new Date(from.getFullYear(), from.getMonth(), from.getDate(), this.hours, this.minutes);
  }

  toJSON(): TimeSerializable {
    return {
      hours: this.hours,
      minutes: this.minutes,
    };
  }

  isBefore(time: Time): boolean {
    return this.compareTo(time) < 0;
  }

  equals(that: Time): boolean {
    return this.globalMinutes === that.globalMinutes;
  }

  isAfter(time: Time): boolean {
    return this.compareTo(time) > 0;
  }

  compareTo(that: Time): number {
    return this.globalMinutes - that.globalMinutes;
  }

  static now(): string {
    return new Time().toString();
  }

  static fromMinutes(totalMinutes: number): Time {
    const hours = totalMinutesToTimeHours(totalMinutes);
    const minutes = totalMinutesToTimeMinutes(totalMinutes);

    return new Time(hours, minutes);
  }

  add(minutes: number): Time {
    const { globalMinutes } = this;

    const minutesSum = globalMinutes + minutes;

    return Time.fromMinutes(minutesSum);
  }

  sub(minutes: number): Time {
    const { globalMinutes } = this;

    const diff = globalMinutes - minutes;

    const nextMinutes = diff > 0 ? diff : MINUTES_DAY + diff;

    return Time.fromMinutes(nextMinutes);
  }

  static fromString(value: string): Time {
    const splitRawTime = value.split(TIME_SEPARATOR);
    if (splitRawTime.length !== 2) throw new WeekDataStructureError(value, 'Time');

    const [rawHours, rawMinutes] = splitRawTime;

    if (rawHours.length !== 2 || rawMinutes.length !== 2) {
      throw new WeekDataStructureError(value, 'Time');
    }

    const hours = parseIntegerOrThrow(rawHours, new WeekDataStructureError(value, 'Time'));
    const minutes = parseIntegerOrThrow(rawMinutes, new WeekDataStructureError(value, 'Time'));

    if (hours < 0 || minutes < 0) {
      throw new WeekDataStructureError(value, 'Time');
    }



    return new Time({ hours, minutes });
  }

  get totalMinutes(): number {
    return this.globalMinutes;
  }

  get hours(): number {
    return totalMinutesToTimeHours(this.globalMinutes);
  }

  get minutes(): number {
    return totalMinutesToTimeMinutes(this.globalMinutes);
  }
}
