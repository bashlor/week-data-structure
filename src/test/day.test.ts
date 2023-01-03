import { DaySerializable } from '../type/day.type';
import { Day } from '../day';
import { DayTypeEnum } from '../type/date.type';
import { Task } from '../task';

const sundayString = '0;06:30-07:30,07:30-10:30';
const mondayString = '1;04:30-07:30,07:30-12:30';
const tuesdayString = '2;14:30-17:00,19:45-22:15';
const sunday = Day.fromString(sundayString);
const monday = Day.fromString(mondayString);
const tuesday = Day.fromString(tuesdayString);

describe('Day class', () => {
  describe('constructor', () => {
    it('should instance without params', () => {
      expect(new Day(0)).toBeDefined();
      expect(new Day(0).equals(new Day(0))).toBeTruthy();
    });

    /**
     it('should instance from another Day instance', () => {
      expect(new Day(sunday).equals(sunday)).toBeTruthy();
      expect(new Day(Day.fromString(sundayString)).equals(sunday)).toBeTruthy();
    });
     **/
  });

  describe('fromString', () => {
    it('can parse a formatted string', () => {
      expect(Day.fromString(sundayString)).toBeDefined();
      expect(() => Day.fromString('')).toThrow();
    });
  });

  describe('toString', () => {
    it('should serialize to a formatted string', () => {
      expect(sunday.toString()).toBeDefined();
      expect(sunday.equals(Day.fromString(sunday.toString()))).toBeTruthy();
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

  describe('getters', () => {
    it('tasks', () => {
      const wednesday = Day.fromString('2;14:30-17:00,19:45-22:15');

      expect(wednesday.tasks.length).toBe(0);
      const task1 = new Task('task1', 'domain1', 'description1');
      const task2 = new Task('task2', 'domain2', 'description2');

      wednesday.set('18:30-19:00', task1);
      wednesday.set('19:00-19:30', task2);

      expect(wednesday.tasks.length).toBe(2);
    });
  });

  describe('insert', () => {
    const wednesday = Day.fromString('2;12:00-14:00,18:00-20:00');
    const task1 = new Task('task1', 'domain1', 'description1');
    const task2 = new Task('task2', 'domain2', 'description2');

    it('can insert a task', () => {
      wednesday.insert('12:00-13:00', task1);
      expect(wednesday.tasks.length).toBe(1);

      wednesday.insert('18:00-19:00', task2);
      expect(wednesday.tasks.length).toBe(2);

      expect(wednesday.toJSON().timeslots.length).toBe(4);

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
  });
});
