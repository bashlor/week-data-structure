import { computeMinutes, totalMinutesToTimeHours, totalMinutesToTimeMinutes } from './util/time.util';
import { MINUTES_DAY, TIME_SEPARATOR } from './constant/time.constant';
import { TimeSerializable } from './type/time.type';
import { WeekDataStructureError } from './error/week-data-structure.error';
import { parseIntegerOrThrow } from './util/function.util';

/**
 * The Time class represents a time of day with a hour and minute value.
 * It can be constructed in several ways, including from a Date object,
 * a serialized object containing hours and minutes, or hour and minute values.
 * The Time class includes several methods for comparing, adding, and converting
 * times to different formats.
**/
export class Time {
  private readonly globalMinutes: number;


  /**
   * Constructs a new Time object with the current time.
   */
  constructor();
  /**
   * Constructs a new Time object with the specified number of hours and optional number of minutes.
   * @param hours The number of hours.
   * @param minutes The number of minutes.
   */
  constructor(hours: number, minutes?: number);
  /**
   * Constructs a new Time object from a serialized object containing hours and minutes.
   * @param value A serialized Time object.
   */
  constructor(value: TimeSerializable);
  /**
   * Constructs a new Time object from an existing Time object.
   * @param value An existing Time object.
   */
  constructor(value: Time);
  /**
   * Constructs a new Time object from a Date object.
   * @param value A Date object.
   */
  constructor(value: Date);
  /**
   * Constructs a new Time object in one of several ways.
   * If no arguments are provided, the current time is used.
   * If a number is provided, it is interpreted as the number of hours, with an optional number of minutes.
   * If a serialized Time object is provided, it is used to construct the Time.
   * If a Time object is provided, it is used to construct a new Time object.
   * If a Date object is provided, it is used to construct a new Time object.
   * @param valueOrHours A serialized Time object, Time object, Date object, or number of hours.
   * @param minutes The number of minutes.
   */
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

  /**
   * Returns a string representation of the Time object in the format 'HH:mm'.
   * @returns A string representation of the Time object.
   */
  toString(): string {
    const { hours, minutes } = this;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }


  /**
   * Returns a Date object with the same year, month, and day as the provided Date object,
   * and the hour and minute values of the Time object. If no Date object is provided,
   * the current date is used.
   * @param from A Date object to use as the base for the returned Date object.
   * @returns A Date object with the same year, month, and day as the provided Date object,
   * and the hour and minute values of the Time object.
   */
  toDate(from: Date = new Date()): Date {
    return new Date(from.getFullYear(), from.getMonth(), from.getDate(), this.hours, this.minutes);
  }

  /**
   * Returns a serialized object with the hour and minute values of the Time object.
   * @returns A serialized Time object.
   */
  toJSON(): TimeSerializable {
    return {
      hours: this.hours,
      minutes: this.minutes,
    };
  }

  /**
   * Returns a boolean indicating whether the Time object occurs before the provided Time object.
   * @param time The Time object to compare to.
   * @returns A boolean indicating whether the Time object occurs before the provided Time object.
   */
  isBefore(time: Time): boolean {
    return this.compareTo(time) < 0;
  }

  /**
   * Returns a boolean indicating whether the Time object is equal to the provided Time object.
   * @param that The Time object to compare to.
   * @returns A boolean indicating whether the Time object is equal to the provided Time object.
   */
  equals(that: Time): boolean {
    return this.globalMinutes === that.globalMinutes;
  }

  /**
   * Returns a boolean indicating whether the Time object occurs after the provided Time object.
   * @param time The Time object to compare to.
   * @returns A boolean indicating whether the Time object occurs after the provided Time object.
   */
  isAfter(time: Time): boolean {
    return this.compareTo(time) > 0;
  }

  /**
   * Compares the Time object to the provided Time object and returns a number indicating whether the Time object
   * occurs before, after, or at the same time as the provided Time object.
   * @param that The Time object to compare to.
   * @returns A number indicating whether the Time object occurs before (-1), after (1), or at the same time (0) as the provided Time object.
   */
  compareTo(that: Time): number {
    return this.globalMinutes - that.globalMinutes;
  }

  /**
   * Returns a new Time object with the current time.
   * @returns A new Time object with the current time.
   */
  static now(): string {
    return new Time().toString();
  }

  /**
 * Returns a new Time object with the specified number of minutes.
 * @param totalMinutes The number of minutes.
 * @returns A new Time object with the specified number of minutes
 */
  static fromMinutes(totalMinutes: number): Time {
    const hours = totalMinutesToTimeHours(totalMinutes);
    const minutes = totalMinutesToTimeMinutes(totalMinutes);

    return new Time(hours, minutes);
  }

  /**
   * Returns a new Time object with the specified number of minutes added to the Time object.
   * @param minutes The number of minutes to add.
   * @returns A new Time object with the specified number of minutes added.
   */
  add(minutes: number): Time {
    const { globalMinutes } = this;

    const minutesSum = globalMinutes + minutes;

    return Time.fromMinutes(minutesSum);
  }

  /**
   * Returns a new Time object with the specified number of minutes subtracted from the Time object.
   * If the result would be negative, the number of minutes is added to the Time object instead.
   * @param minutes The number of minutes to subtract.
   * @returns A new Time object with the specified number of minutes subtracted.
   */
  sub(minutes: number): Time {
    const { globalMinutes } = this;

    const diff = globalMinutes - minutes;

    const nextMinutes = diff > 0 ? diff : MINUTES_DAY + diff;

    return Time.fromMinutes(nextMinutes);
  }

  /**
   * Returns a new Time object from the provided string in the format 'HH:mm'.
   * @param value The string to parse.
   * @returns A new Time object parsed from the provided string.
   * @throws {WeekDataStructureError} If the string is not in the correct format.
   */
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

  /**
   * Returns the total number of minutes represented by the Time object.
   * @returns The total number of minutes represented by the Time object.
   */
  get totalMinutes(): number {
    return this.globalMinutes;
  }

  /**
   * Returns the number of hours represented by the Time object.
   * @returns The number of hours represented by the Time object.
   */
  get hours(): number {
    return totalMinutesToTimeHours(this.globalMinutes);
  }

  /**
   * Returns the number of minutes represented by the Time object.
   * @returns The number of minutes represented by the Time object.
   */
  get minutes(): number {
    return totalMinutesToTimeMinutes(this.globalMinutes);
  }
}
