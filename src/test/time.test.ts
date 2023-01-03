import { Time } from '../time';

const timeString = '12:30';
const timeAfterString = '14:05';
const timeBeforeString = '09:05';

const strings = [timeString, timeAfterString, timeBeforeString];
const stringsObjects = [
  [timeString, { hours: 12, minutes: 30 }],
  [timeAfterString, { hours: 14, minutes: 5 }],
  [timeBeforeString, { hours: 9, minutes: 5 }],
] as const;

describe('Time class', () => {
  describe('constructor', () => {
    const time = Time.fromString(timeString);

    it('can be created without params', () => {
      expect(new Time()).toBeInstanceOf(Time);
    });

    it('can be created with numbers', () => {
      const time1 = new Time(12, 30);
      const time2 = new Time(14);

      expect(time1.hours).toBe(12);
      expect(time1.minutes).toBe(30);

      expect(time2.hours).toBe(14);
      expect(time2.minutes).toBe(0);

    });

    it('can be created from a Date', () => {
      const date = new Date(2022,8,22,15,30);
      const time = new Time(date);
      expect(time.hours).toBe(15);
      expect(time.minutes).toBe(30);
    });

    it('can be created from a Time', () => {
      expect(new Time(time)).toBeDefined();
    });

    it('can be created from a TimeSerializable', () => {
      const time = new Time({ hours: 14, minutes: 30 });
        expect(time.hours).toBe(14);
        expect(time.minutes).toBe(30);
    })

  });

  describe('getters', () => {
    const time = Time.fromString(timeString);
    it('hours should be 12', () => {
      expect(time.hours).toBe(12);
    });

    it('minutes should be 30', () => {
      expect(time.minutes).toBe(30);
    });
  });

  describe('now', () => {
    const dateNow = new Date();
    const timeNow = Time.now();
    const testTime = Time.fromString(timeNow);

    expect(testTime.hours).toStrictEqual(dateNow.getHours());
    expect(testTime.minutes).toStrictEqual(dateNow.getMinutes());
  });

  describe('fromString', () => {
    it.each(stringsObjects)('it should parse %s to %o', (time, json) => {
      expect(Time.fromString(time).toJSON()).toStrictEqual(json);
      expect(Time.fromString(time).toJSON()).toStrictEqual(json);

      expect(Time.fromString(time).toJSON()).toStrictEqual(json);
    });
    it.each(['12:000', '12', ':00', '24:00', '23:60'])('should throw an error on invalid value %s', (time) => {
      expect(() => Time.fromString(time)).toThrow();
    });
  });

  describe('equals', () => {
    it('should be equals to self', () => {
      const time = Time.fromString(timeString);
      expect(time.equals(time)).toBeTruthy();
    });
  });

  describe('toString', () => {
    it.each(strings)('should serialize to %s', (time) => {
      expect(Time.fromString(time).toString()).toBe(time);
    });
  });

  describe('toJSON', () => {
    it('should be serializable and de-serializable', () => {
      const time = Time.fromString(timeString);
      const serialized = time.toJSON();
      expect(time).toStrictEqual(new Time(serialized));
    });
  });

  describe('toDate', () => {
    it('should be convertible to Date', () => {
      const time = Time.fromString(timeString);
      expect(time.toDate() instanceof Date).toBeTruthy();
      expect(time.hours).toBe(time.toDate().getHours());
      expect(time.minutes).toBe(time.toDate().getMinutes());
    });
  });

  describe('compareTo', () => {
    it('should compare times', () => {
      const time = Time.fromString(timeString);
      const timeAfter = Time.fromString(timeAfterString);
      const timeBefore = Time.fromString(timeBeforeString);

      expect(time.compareTo(timeAfter)).toBeLessThan(0);
      expect(timeAfter.compareTo(time)).toBeGreaterThan(0);

      expect(time.compareTo(timeBefore)).toBeGreaterThan(0);
      expect(timeBefore.compareTo(time)).toBeLessThan(0);
    });

  });

  describe('isAfter', () => {
    it(`${timeString} should be after ${timeBeforeString}`, () => {
      const time = Time.fromString(timeString);
      const timeBefore = Time.fromString(timeBeforeString);

      expect(time.isAfter(timeBefore)).toBeTruthy();
      expect(timeBefore.isAfter(time)).toBeFalsy();
    });

    it(`${timeString} should not be after ${timeAfterString}`, () => {
      const time = Time.fromString(timeString);
      const timeAfter = Time.fromString(timeAfterString);

      expect(timeAfter.isAfter(time)).toBeTruthy();
      expect(time.isAfter(timeAfter)).toBeFalsy();
    });
  });

  describe('add', () => {
    it.each([
      [15, '09:15', '09:30'],
      [60, '09:15', '10:15'],
      [60 * 2, '09:15', '11:15'],
      [60 * 24, '09:15', '09:15'],
      [60 * 23, '09:15', '08:15'],
    ])('should add %i minutes to %s', (minutes, time, sum) => {
      expect(Time.fromString(time).add(minutes).equals(Time.fromString(sum))).toBe(true);
    });
  });
  describe('sub', () => {
    it.each([
      [15, '09:15', '09:00'],
      [60, '09:15', '08:15'],
      [60 * 2, '09:15', '07:15'],
      [60 * 24, '09:15', '09:15'],
      [60 * 23, '09:15', '10:15'],
    ])('should subtract %i minutes from %s', (minutes, time, diff) => {
      expect(Time.fromString(time).sub(minutes).equals(Time.fromString(diff))).toBe(true);
    });
  });

  describe('totalMinutes', () => {
    it('should return the total minutes', () => {
      const time = Time.fromString(timeString);
      expect(time.totalMinutes).toBe(time.hours * 60 + time.minutes);
    });
  });
});
