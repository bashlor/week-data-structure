import { DayParsable, DaySerializable } from '../type/day.type';
import { Day } from '../day';
import { DayTypeEnum } from '../type/date.type';
import { Task } from '../task';
import { Time } from '../time';
import { TimeslotSeriesOptions } from '../type/timeslot.type';
import { Timeslot } from '../timeslot';
import { DEFAULT_END_DAY_LIMIT, DEFAULT_START_DAY_LIMIT } from '../constant/day.constant';

const sundayString = '6;06:30-07:30,07:30-10:30';
const mondayString = '0;04:30-07:30,07:30-12:30';
const tuesdayString = '1;14:30-17:00,19:45-22:15';
const sunday = Day.fromString(sundayString);
const monday = Day.fromString(mondayString);
const tuesday = Day.fromString(tuesdayString);

describe('Day class', () => {
  describe('constructor', () => {
    let currentTestIndex = 0;

    const monday2Options = {
      allowTimeslotMerging: true,
      defaultStartLimit: Time.fromString('08:30'),
      defaultEndLimit: Time.fromString('18:30'),
    };
    const monday3Options = {
      allowTimeslotMerging: false,
      defaultStartLimit: Time.fromString('09:30'),
      defaultEndLimit: Time.fromString('19:30'),
    };

    const wednesdayOptions = {
      allowTimeslotMerging: false,
      defaultStartLimit: Time.fromString('00:00'),
      defaultEndLimit: Time.fromString('23:59'),
    };

    const thursdayOptions2 = {
      allowTimeslotMerging: false,
      defaultStartLimit: Time.fromString('10:00'),
      defaultEndLimit: Time.fromString('20:00'),
    };

    const defaultOptions = {
      allowTimeslotMerging: true,
      defaultStartLimit: Time.fromString(DEFAULT_START_DAY_LIMIT),
      defaultEndLimit: Time.fromString(DEFAULT_END_DAY_LIMIT),
    };

    const monday2 = new Day(0, monday2Options);

    const monday3 = new Day(null, monday3Options);

    const wednesday = new Day(DayTypeEnum.wednesday, wednesdayOptions);

    const thursday = new Day(DayTypeEnum.thursday);

    const thursday2 = new Day(thursday, thursdayOptions2);

    const customOptions = [monday2Options, monday3Options, wednesdayOptions, defaultOptions, thursdayOptions2];

    const daysWithCustomOptions = [monday2, monday3, wednesday, thursday, thursday2];

    it('should instance a day with no parameter', () => {
      const day = new Day();
      expect(day).toBeInstanceOf(Day);
    });

    it('should instance a day with null passed as param', () => {
      const day = new Day(null);
      expect(day).toBeInstanceOf(Day);
    });

    it('should instance using int params', () => {
      expect(new Day(0)).toBeDefined();
      expect(new Day(0).equals(new Day(0))).toBeTruthy();
    });

    it('should instance from another Day instance', () => {
      expect(new Day(sunday).equals(sunday)).toBeTruthy();
      expect(new Day(Day.fromString(sundayString)).equals(sunday)).toBeTruthy();
    });

    it('should instance from a type DayTypeEnum', () => {
      expect(new Day(DayTypeEnum.sunday).equals(sunday)).toBeFalsy();
    });

    it('should instance from a DayParsable', () => {
      const timeslots = ['06:30-07:30', '07:30-10:30'].map((timeslot) => Timeslot.fromString(timeslot));

      const dayParsableParams: DayParsable = {
        dayOfWeek: 'sunday',
        timeslots,
      };
      expect(new Day(dayParsableParams).equals(sunday)).toBeTruthy();
    });

    it.each(daysWithCustomOptions)('should handle TimeslotSerieOptions correctly for each type parameter', (day) => {
      expect(day.specs).toEqual(customOptions[currentTestIndex]);
      currentTestIndex++;
    });

    it('should fail in TimeslotSerieOptions has been set,  but timeslots passed in constructor does not match with limits', () => {
      expect(() => Day.fromString('0;07:00-08:00', monday2Options)).toThrow();

      const timeslots = ['01:30-05:30', '19:30-20:30'].map((timeslot) => Timeslot.fromString(timeslot).toJSON());

      const dayParsableParams: DayParsable = {
        dayOfWeek: 'sunday',
        timeslots,
      };

      expect(
        () =>
          new Day(dayParsableParams, {
            defaultStartLimit: Time.fromString('08:00'),
            defaultEndLimit: Time.fromString('22:00'),
          }),
      ).toThrow();
    });
  });

  describe('fromString', () => {
    it('can parse a formatted string', () => {
      expect(Day.fromString(sundayString)).toBeDefined();
      expect(Day.fromString(sundayString).equals(sunday)).toBeTruthy();
      expect(() => Day.fromString('')).toThrow();
    });

    it('should be able to handle custom timeslot series options', () => {
      const timeslotSeriesOptions: TimeslotSeriesOptions = {
        allowTimeslotMerging: false,
        defaultStartLimit: Time.fromString('06:00'),
        defaultEndLimit: Time.fromString('20:00'),
      };
      const day = Day.fromString(sundayString, timeslotSeriesOptions);
      expect(day.specs).toEqual(timeslotSeriesOptions);
    });
  });

  describe('toString', () => {
    it('should serialize to a formatted string', () => {
      expect(sunday.toString()).toBeDefined();
      expect(sunday.equals(Day.fromString(sunday.toString()))).toBeTruthy();
    });

    it('should be able to handle custom options', () => {
      expect(
        sunday.toString({
          includeDay: false,
        }),
      ).toEqual(sundayString.split(';')[1]);

      expect(
        sunday.toString({
          includeDay: true,
        }),
      ).toEqual(sundayString);
    });
  });

  describe('formatString', () => {
    const formattedString1 = Day.formatString('sunday', sundayString.split(';')[1]);
    const formattedString2 = Day.formatString(6, sundayString.split(';')[1]);

    expect(formattedString1).toEqual(sundayString);
    expect(formattedString2).toEqual(sundayString);
  });

  describe('fromTimeslotSeries()', () => {
    it('should create a day from a timeslot series', () => {
      const timeslotSeries = sunday.timeslotSeries;
      const day = Day.fromTimeslotSeries(timeslotSeries, 'sunday');

      expect(day).toBeDefined();
      expect(day.equals(sunday)).toBeTruthy();
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      const json: DaySerializable = { dayOfWeek: 'monday', timeslots: [] };
      expect(sunday.toJSON()).toStrictEqual(JSON.parse(JSON.stringify(sunday)));
      expect(new Day(0).toJSON()).toStrictEqual(json);
    });
  });

  describe('compareTo', () => {
    it('can be compared', () => {
      expect(new Day(DayTypeEnum.sunday).compareTo(new Day(DayTypeEnum.sunday))).toBe(0);
      expect(monday.compareTo(monday)).toBe(0);
      expect(monday.compareTo(tuesday)).toBeLessThan(0);
      expect(tuesday.compareTo(monday)).toBeGreaterThan(0);
    });
  });

  describe('isAfter', () => {
    expect(monday.isAfter(tuesday)).toBeFalsy();
    expect(tuesday.isAfter(monday)).toBeTruthy();
  });

  describe('equals', () => {
    it('can be compared', () => {
      expect(monday.equals(monday)).toBeTruthy();
      expect(monday.equals(tuesday)).toBeFalsy();
    });

    it('should return false if the timeslots are the same but the day is different', () => {
      const saturdayDayObject = Day.fromString('5;08:00-12:00,13:00-17:00');
      const sundayDayObject = Day.fromString('6;08:00-12:00,13:00-17:00');
      expect(saturdayDayObject.equals(sundayDayObject)).toBeFalsy();
    });

    it('should return false if the timeslots are different but the day is the same', () => {
      const mondayDayObject = Day.fromString('1;08:00-12:00,13:00-17:00');
      const mondayDayObject2 = Day.fromString('1;08:00-12:00,13:00-17:00,18:00-20:00');
      expect(mondayDayObject.equals(mondayDayObject2)).toBeFalsy();
    });

    it('should return true if the timeslots are the same but the time merging is not allowed for one of the two days', () => {
      const mondayDayObject = Day.fromString('1;08:00-12:00,13:00-17:00', { allowTimeslotMerging: false });
      const mondayDayObject2 = Day.fromString('1;08:00-12:00,13:00-17:00', { allowTimeslotMerging: true });
      expect(mondayDayObject.equals(mondayDayObject2)).toBeTruthy();
    });

    it('should return false if the days has the same timeslots but one of the days has a different default start limit', () => {
      const mondayDayObject = Day.fromString('1;08:00-12:00,13:00-17:00', {
        defaultStartLimit: Time.fromString('06:00'),
      });
      const mondayDayObject2 = Day.fromString('1;08:00-12:00,13:00-17:00', {
        defaultStartLimit: Time.fromString('08:00'),
      });
      expect(mondayDayObject.equals(mondayDayObject2)).toBeFalsy();
    });

    it('should return false if the days has the same timeslots but one of the days has a different default end limit', () => {
      const mondayDayObject = Day.fromString('1;08:00-12:00,13:00-17:00', {
        defaultEndLimit: Time.fromString('17:00'),
      });
      const mondayDayObject2 = Day.fromString('1;08:00-12:00,13:00-17:00', {
        defaultEndLimit: Time.fromString('18:00'),
      });
      expect(mondayDayObject.equals(mondayDayObject2)).toBeFalsy();
    });

    it('should return false if the days has the same timeslots but one the days has tasks, and the other does not', () => {
      const mondayDayObject = Day.fromString('1;08:00-12:00,13:00-17:00');
      const mondayDayObject2 = Day.fromString('1;08:00-12:00,13:00-17:00');
      mondayDayObject.set('09:00-10:00', new Task('test'));
      expect(mondayDayObject.equals(mondayDayObject2)).toBeFalsy();
    });

    it('should return false if both days have tasks and same timeslots, but the tasks are different (does not have the same id)', () => {
      const mondayDayObject = Day.fromString('1;08:00-12:00,13:00-17:00');
      const mondayDayObject2 = Day.fromString('1;08:00-12:00,13:00-17:00');
      mondayDayObject.set('09:00-10:00', new Task('test'));
      mondayDayObject2.set('09:00-10:00', new Task('test'));
      expect(mondayDayObject.equals(mondayDayObject2)).toBeFalsy();
    });

    it('should return true if both days have same timeslots, and the tasks are the same', () => {
      const mondayDayObject = Day.fromString('0;08:00-12:00,13:00-17:00');
      const mondayDayObject2 = Day.fromString('0;08:00-12:00,13:00-17:00');
      const task = new Task('test');
      mondayDayObject.set('09:00-10:00', task);
      mondayDayObject2.set('09:00-10:00', task);
      expect(mondayDayObject.equals(mondayDayObject2)).toBeTruthy();
    });
  });

  describe('getters', () => {
    it('tasks', () => {
      const wednesday = Day.fromString('2;14:30-17:00,19:45-22:15');

      expect(wednesday.tasks.length).toBe(0);
      const task1 = new Task('task1');
      const task2 = new Task('task2');

      wednesday.set('18:30-19:00', task1);
      wednesday.set('19:00-19:30', task2);

      expect(wednesday.tasks.length).toBe(2);
      expect(wednesday.tasks).toContain(task1);
      expect(wednesday.tasks).toContain(task2);
    });

    it('day', () => {
      expect(monday.day).toBe("monday");
    });

    it('timeslots', () => {
      expect(monday.timeslots.length).toBe(2);
      const timeslot1 = new Timeslot(Time.fromString('04:30'), Time.fromString('07:30'));
      const timeslot2 = new Timeslot(Time.fromString('07:30'), Time.fromString('12:30'));

      const findTimeslot = (timeslot: Timeslot) => monday.timeslots.find((ts) => ts.equals(timeslot));

      expect(findTimeslot(timeslot1)).toBeTruthy();
      expect(findTimeslot(timeslot2)).toBeTruthy();
    });

    it('specs', () => {
      expect(monday.specs).toBeDefined();
    });
  });

  describe('set', () => {
    it('should throw an error if the timeslot is over or under the  defined limit', () => {});

    it('should throw an error if the timeslot is overlapping another one', () => {});
  });

  describe('insert', () => {
    const wednesday = Day.fromString('2;12:00-14:00,18:00-20:00');
    const task1 = new Task('task1');
    const task2 = new Task('task2');

    it('can insert a task using string', () => {
      wednesday.insert('12:00-13:00', task1);
      expect(wednesday.tasks.length).toBe(1);

      wednesday.insert('18:00-19:00', task2);
      expect(wednesday.tasks.length).toBe(2);

      expect(wednesday.toJSON().timeslots.length).toBe(4);
    });

    it('can insert a task using Timeslot object', () => {
      const wednesday2 = Day.fromString('2;12:00-14:00,18:00-20:00');
      const timeslot1 = Timeslot.fromString('12:00-13:00');
      const timeslot2 = Timeslot.fromString('18:00-19:00');

      wednesday2.insert(timeslot1, task1);
      expect(wednesday2.tasks.length).toBe(1);

      wednesday2.insert(timeslot2, task2);
      expect(wednesday2.tasks.length).toBe(2);

      expect(wednesday2.toJSON().timeslots.length).toBe(4);
    });

    it('can delete a task using a string', () => {
      const deletionResult = wednesday.delete('12:00-13:00');
      expect(deletionResult).toBeTruthy();
      expect(wednesday.toJSON().timeslots.length).toBe(3);

      wednesday.delete('18:00-19:00');
      expect(wednesday.toJSON().timeslots.length).toBe(2);

      const saturday = Day.fromString('0;07:55-08:40');
      saturday.insert('08:00-08:10', task1);
      saturday.insert('08:10-08:20', task2);
      expect(saturday.tasks.length).toBe(2);
    });

    it('can delete a task using a Timeslot object', () => {
      const wednesday2 = Day.fromString('2;12:00-14:00,18:00-20:00');
      const timeslot1 = Timeslot.fromString('12:00-13:00');
      const timeslot2 = Timeslot.fromString('18:00-19:00');

      wednesday2.insert(timeslot1, task1);
      expect(wednesday2.tasks.length).toBe(1);

      wednesday2.insert(timeslot2, task2);
      expect(wednesday2.tasks.length).toBe(2);

      expect(wednesday2.toJSON().timeslots.length).toBe(4);
    });
  });
});
