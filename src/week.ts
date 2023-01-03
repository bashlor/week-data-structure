import { DayLabels, DayType, DayTypeEnum } from './type/date.type';
import { Day } from './day';
import { WeekParsable, WeekTuple } from './type/week.type';
import { TimeslotSerie } from './timeslot-serie';
import { WEEK_SEPARATOR } from './constant/time.constant';

export class Week extends Map<DayType, Day> {
  constructor(value: Week);
  constructor(value: WeekParsable);
  constructor(value: WeekParsable | Week) {
    if (value instanceof Week) {
      super(new Map(value));
      return;
    }

    const temp = DayLabels.map((dayType) => {
      const timeslots = value[dayType] ?? [];
      const day = Day.fromTimeslotSerie(new TimeslotSerie({ timeslots }), dayType);
      return [dayType, day] as const;
    });
    super(new Map(temp));
  }

  get monday(): Day {
    return this.get(DayLabels[DayTypeEnum.monday]);
  }

  get tuesday(): Day {
    return this.get(DayLabels[DayTypeEnum.tuesday]);
  }

  get wednesday(): Day {
    return this.get(DayLabels[DayTypeEnum.wednesday]);
  }

  get thursday(): Day {
    return this.get(DayLabels[DayTypeEnum.thursday]);
  }

  get friday(): Day {
    return this.get(DayLabels[DayTypeEnum.friday]);
  }

  get saturday(): Day {
    return this.get(DayLabels[DayTypeEnum.saturday]);
  }

  get sunday(): Day {
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

  static fromDay(value: Day) {
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

  emptyTimeslots(day?: DayType) {
    if (day) {
      return this[day].empty();
    }
    return {
      monday: this.monday.empty(),
      tuesday: this.tuesday.empty(),
      wednesday: this.wednesday.empty(),
      thursday: this.thursday.empty(),
      friday: this.friday.empty(),
      saturday: this.saturday.empty(),
      sunday: this.sunday.empty(),
    };
  }

  static fromTimeslotSerie(value: TimeslotSerie): Week {
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

  get(key: DayType): Day {
    const value = super.get(key);
    if (value === null) {
      const day = Day.fromTimeslotSerie(new TimeslotSerie({ timeslots: [] }), key);

      super.set(key, day);

      return day;
    }
    return value;
  }

  set(key: DayType, value: Day): this {
    super.set(key, value);
    return this;
  }
}
