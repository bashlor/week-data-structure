import { DayLabels, DayType, DayTypeEnum } from './type/date.type';
import { Day } from './day';
import { WeekParsable, WeekTuple } from './type/week.type';
import { TimeslotSeries } from './timeslot-series';
import { WEEK_SEPARATOR } from './constant/time.constant';

/**
 * Represents a week with seven days.
 *
 * @extends {Map<DayType, Day<unknown>>}
 */
export class Week extends Map<DayType, Day<unknown>> {

  /**
   * Creates a new instance of the `Week` class.
   *
   * @param {Week} value - The existing `Week` instance to copy.
   */
  constructor(value: Week);

  /**
   * Creates a new instance of the `Week` class.
   *
   * @param {WeekParsable} value - The data to use to create a new `Week` instance.
   */
  constructor(value: WeekParsable);

  /**
   * Creates a new instance of the `Week` class.
   *
   * @param {WeekParsable | Week} value - The data to use to create a new `Week` instance or an existing `Week` instance to copy.
   */
  constructor(value: WeekParsable | Week) {
    if (value instanceof Week) {
      super(new Map(value));
      return;
    }

    const temp = DayLabels.map((dayType) => {
      const timeslots = value[dayType] ?? [];
      const day = Day.fromTimeslotSeries(new TimeslotSeries({ timeslots }), dayType);
      return [dayType, day] as const;
    });
    super(new Map(temp));
  }

  /**
   * Returns the `Day` object for Monday.
   *
   * @returns {Day<unknown>} The `Day` object for Monday.
   */
  get monday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.monday]);
  }

  /**
   * Returns the `Day` object for Tuesday.
   *
   * @returns {Day<unknown>} The `Day` object for Tuesday.
   */
  get tuesday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.tuesday]);
  }

  /**
   * Returns the `Day` object for Wednesday.
   *
   * @returns {Day<unknown>} The `Day` object for Wednesday.
   */
  get wednesday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.wednesday]);
  }

  /**
   * Returns the `Day` object for Thursday.
   *
   * @returns {Day<unknown>} The `Day` object for Thursday.
   */
  get thursday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.thursday]);
  }

  /**
   * Returns the `Day` object for Friday.
   *
   * @returns {Day<unknown>} The `Day` object for Friday.
   */
  get friday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.friday]);
  }

  /**
   * Returns the `Day` object for Saturday.
   *
   * @returns {Day<unknown>} The `Day` object for Saturday.
   */
  get saturday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.saturday]);
  }

  /**
   * Returns the `Day` object for Sunday.
   *
   * @returns {Day<unknown>} The `Day` object for Sunday.
   */
  get sunday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.sunday]);
  }

  /**
   * Returns the days of the week as a tuple.
   *
   * @returns {WeekTuple} The days of the week as a tuple.
   */
  toTuple(): WeekTuple {
    return [
      this.get(DayLabels[DayTypeEnum.monday]),
      this.get(DayLabels[DayTypeEnum.tuesday]),
      this.get(DayLabels[DayTypeEnum.wednesday]),
      this.get(DayLabels[DayTypeEnum.thursday]),
      this.get(DayLabels[DayTypeEnum.friday]),
      this.get(DayLabels[DayTypeEnum.saturday]),
      this.get(DayLabels[DayTypeEnum.sunday]),
    ];
  }


  /**
   * Creates a new `Week` instance with all days set to the same values as the provided `Day` object.
   *
   * @param {Day<T>} value - The `Day` object to use to create the new `Week` instance.
   * @returns {Week} The new `Week` instance.
   */
  static fromDay<T>(value: Day<T>) {
    return new Week({
      monday: value.toJSON().timeslots,
      tuesday: value.toJSON().timeslots,
      wednesday: value.toJSON().timeslots,
      thursday: value.toJSON().timeslots,
      friday: value.toJSON().timeslots,
      saturday: value.toJSON().timeslots,
      sunday: value.toJSON().timeslots,
    });
  }

  /**
   * Returns an object containing the empty timeslots for a specific day of the week or all days of the week.
   *
   * @param {DayType} [day] - The day of the week to get the empty timeslots for.
   * @param {boolean} [extendToLimit=false] - Whether to extend the empty timeslots to the time limits of the day.
   * @returns {DayTypeEmptyTimeslots | WeekTypeEmptyTimeslots} An object containing the empty timeslots for the specified day or all days of the week.
   */
  getEmptyTimeslots(day?: DayType,extendToLimit = false) {
    if (day) {
      return this[day].getEmptyTimeslots(extendToLimit);
    }
    return {
      monday: this.monday.getEmptyTimeslots(extendToLimit),
      tuesday: this.tuesday.getEmptyTimeslots(extendToLimit),
      wednesday: this.wednesday.getEmptyTimeslots(extendToLimit),
      thursday: this.thursday.getEmptyTimeslots(extendToLimit),
      friday: this.friday.getEmptyTimeslots(extendToLimit),
      saturday: this.saturday.getEmptyTimeslots(extendToLimit),
      sunday: this.sunday.getEmptyTimeslots(extendToLimit),
    };
  }

  /**
   * Creates a new `Week` instance with all days set to the same values as the provided `TimeslotSeries` object.
   *
   * @param {TimeslotSeries} value - The `TimeslotSeries` object to use to create the new `Week` instance.
   * @returns {Week} The new `Week` instance.
   */
  static fromTimeslotSeries(value: TimeslotSeries): Week {
    return new Week({
      monday: value.toJSON().timeslots,
      tuesday: value.toJSON().timeslots,
      wednesday: value.toJSON().timeslots,
      thursday: value.toJSON().timeslots,
      friday: value.toJSON().timeslots,
      saturday: value.toJSON().timeslots,
      sunday: value.toJSON().timeslots,
    });
  }

  /**
   * Returns a string representation of the `Week` object.
   *
   * @returns {string} The string representation of the `Week` object.
   */
  toString(): string {
    return this.toTuple()
      .map((day) => day.toString({ includeDay: true }))
      .join(WEEK_SEPARATOR);
  }


  /**
   * Returns the `Day` object for the specified day of the week.
   *
   * @param {DayType} key - The day of the week to get the `Day` object for.
   * @returns {Day<unknown>} The `Day` object for the specified day of the week.
   */
  get(key: DayType): Day<unknown> {
    const value = super.get(key);
    if (value === null) {
      const day = Day.fromTimeslotSeries(new TimeslotSeries({ timeslots: [] }), key);

      super.set(key, day);

      return day;
    }
    return value;
  }

  /**
   * Sets the `Day` object for the specified day of the week.
   *
   * @param {DayType} key - The day of the week to set the `Day` object for.
   * @param {Day<unknown>} value - The `Day` object to set.
   * @returns {this} The `Week` object.
   */
  set(key: DayType, value: Day<unknown>): this {
    super.set(key, value);
    return this;
  }
}
