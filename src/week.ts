import { DayLabels, DayType, DayTypeEnum } from './type/date.type';
import { Day } from './day';
import { WeekParsable, WeekTuple } from './type/week.type';
import { TimeslotSeries } from './timeslot-series';
import { WEEK_SEPARATOR } from './constant/time.constant';

export class Week extends Map<DayType, Day<unknown>> {
  constructor(value: Week);
  constructor(value: WeekParsable);
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

  get monday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.monday]);
  }

  get tuesday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.tuesday]);
  }

  get wednesday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.wednesday]);
  }

  get thursday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.thursday]);
  }

  get friday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.friday]);
  }

  get saturday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.saturday]);
  }

  get sunday(): Day<unknown> {
    return this.get(DayLabels[DayTypeEnum.sunday]);
  }

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

  toString(): string {
    return this.toTuple()
      .map((day) => day.toString({ includeDay: false }))
      .join(WEEK_SEPARATOR);
  }

  get(key: DayType): Day<unknown> {
    const value = super.get(key);
    if (value === null) {
      const day = Day.fromTimeslotSeries(new TimeslotSeries({ timeslots: [] }), key);

      super.set(key, day);

      return day;
    }
    return value;
  }

  set(key: DayType, value: Day<unknown>): this {
    super.set(key, value);
    return this;
  }
}
