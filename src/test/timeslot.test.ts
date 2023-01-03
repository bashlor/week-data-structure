import { Timeslot } from '../timeslot';
import { Time } from '../time';

describe('Timeslot class', () => {
  const timeslotString = '08:30-10:05';

  const timeslotAfterString = '10:05-11:55';
  const timeslotBeforeString = '05:00-08:30';
  const timeslotSameStartString = '08:30-10:00';

  const timeslot = Timeslot.fromString(timeslotString);
  const timeslotAfter = Timeslot.fromString(timeslotAfterString);
  const timeslotBefore = Timeslot.fromString(timeslotBeforeString);
  const timeslotSameStart = Timeslot.fromString(timeslotSameStartString);

  describe('constructor', () => {
    it('can be created from a tuple of Time', () => {
      const timeslot = new Timeslot([Time.fromString('08:30'), Time.fromString('10:05')]);
      expect(timeslot.start).toEqual(Time.fromString('08:30'));
      expect(timeslot.end).toEqual(Time.fromString('10:05'));
    });

    it('can be created from Time objects parameters', () => {
      const timeslot = new Timeslot(Time.fromString('08:30'), Time.fromString('10:05'));
      expect(timeslot.start).toEqual(Time.fromString('08:30'));
      expect(timeslot.end).toEqual(Time.fromString('10:05'));
    });

    it('can be created from a TimeSerializable', () => {
      const start = { hours: 8, minutes: 30 };
      const end = { hours: 10, minutes: 5 };
      const timeslot = new Timeslot({ start, end });
      expect(timeslot.start).toEqual(Time.fromString('08:30'));
      expect(timeslot.end).toEqual(Time.fromString('10:05'));
    });

    it('can be created from another Timeslot', () => {
      const timeslot = new Timeslot(Time.fromString('08:30'), Time.fromString('10:05'));
      expect(timeslot.start).toEqual(Time.fromString('08:30'));
      expect(timeslot.end).toEqual(Time.fromString('10:05'));
    });

    it('should throw an error if start is after end', () => {
      expect(() => new Timeslot(Time.fromString('10:05'), Time.fromString('08:30'))).toThrow();
    });
  });

  describe('getters', () => {
    it('should return start and end as Time objects', () => {
      const timeslot = new Timeslot(Time.fromString('08:30'), Time.fromString('10:05'));
      expect(timeslot.start).toEqual(Time.fromString('08:30'));
      expect(timeslot.end).toEqual(Time.fromString('10:05'));
    });

    it('should return the duration as a number', () => {
      const timeslot = new Timeslot(Time.fromString('08:30'), Time.fromString('10:05'));
      expect(timeslot.duration).toEqual(95);
    });
  });

  describe('parse', () => {
    it.each([timeslotString, timeslotAfterString, timeslotBeforeString, timeslotSameStartString])(
      'should parse a formatted string',
      (timeslot) => {
        expect(Timeslot.fromString(timeslot)).toBeDefined();
      },
    );

    it('should throw on invalid string', () => {
      const timeslotError = '08:30-07:30';
      const timeslotErrorShort = '08:3007:30';

      expect(() => Timeslot.fromString(timeslotErrorShort)).toThrow();
      expect(() => Timeslot.fromString(timeslotError)).toThrow();
    });
  });

  describe('numberOfSlotsInRange', () => {
    it('should return the max number of slots in a time timeslot', () => {
      expect(Timeslot.numberOfSlotsInRange(Timeslot.fromString('09:00-12:00'), 30)).toBe(6);
      expect(Timeslot.numberOfSlotsInRange(Timeslot.fromString('09:00-09:00'), 30)).toBe(0);
      expect(Timeslot.numberOfSlotsInRange(Timeslot.fromString('09:00-09:30'), 50)).toBe(0);
      expect(Timeslot.numberOfSlotsInRange(Timeslot.fromString('09:00-09:33'), 30)).toBe(0);
      expect(Timeslot.numberOfSlotsInRange(Timeslot.fromString('09:00-09:30'), 27)).toBe(0);
    });
  });

  describe('toString', () => {
    it('should serialize to a parsable string', () => {
      expect(timeslot.toString()).toStrictEqual(timeslotString);
      expect(Timeslot.fromString(timeslot.toString())).toStrictEqual(timeslot);
    });
  });

  describe('toDate', () => {
    it('should serialize to a tuple of dates', () => {
      const [start, end] = timeslot.toDate();
      const [startFrom, endFrom] = timeslot.toDate(new Date(0));
      expect(timeslot.toDate()).toBeDefined();
      expect(start instanceof Date && end instanceof Date).toBeTruthy();
      expect(startFrom instanceof Date && endFrom instanceof Date).toBeTruthy();
      expect(start.getTime() <= end.getTime()).toBeTruthy();
      expect(startFrom.getTime() <= endFrom.getTime()).toBeTruthy();
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      expect(JSON.parse(JSON.stringify(timeslot))).toStrictEqual(timeslot.toJSON());
      expect(new Timeslot(timeslot.toJSON())).toStrictEqual(timeslot);
    });
  });

  describe('compareTo', () => {
    expect(timeslot.compareTo(timeslot)).toBe(0);
    expect(timeslot.compareTo(timeslotAfter)).toBeLessThan(0);
    expect(timeslotAfter.compareTo(timeslot)).toBeGreaterThan(0);

    expect(timeslot.compareTo(timeslotBefore)).toBeGreaterThan(0);
    expect(timeslotBefore.compareTo(timeslot)).toBeLessThan(0);

    expect(timeslot.compareTo(timeslotSameStart)).toBeGreaterThan(0);
    expect(timeslotSameStart.compareTo(timeslot)).toBeLessThan(0);
  });

  describe('equals', () => {
    it('should be true', () => {
      expect(timeslot.equals(timeslot)).toBeTruthy();
      expect(timeslotAfter.equals(timeslotAfter)).toBeTruthy();
      expect(timeslotBefore.equals(timeslotBefore)).toBeTruthy();
      expect(timeslotSameStart.equals(timeslotSameStart)).toBeTruthy();
    });

    it('should be false', () => {
      expect(timeslot.equals(timeslotAfter)).toBeFalsy();
      expect(timeslot.equals(timeslotBefore)).toBeFalsy();
      expect(timeslot.equals(timeslotSameStart)).toBeFalsy();
    });
  });

  describe('isAfter', () => {
    it('should be after', () => {
      expect(timeslotAfter.isAfter(timeslot)).toBeTruthy();
      expect(timeslot.isAfter(timeslotBefore)).toBeTruthy();
    });

    it('should not be after', () => {
      expect(timeslot.isAfter(timeslotAfter)).toBeFalsy();
      expect(timeslotBefore.isAfter(timeslot)).toBeFalsy();
    });
  });

  describe('isBefore', () => {
    it('should be before', () => {
      expect(timeslotBefore.isBefore(timeslot)).toBeTruthy();
      expect(timeslot.isBefore(timeslotAfter)).toBeTruthy();
    });
    it('should not be before', () => {
      expect(timeslot.isBefore(timeslotBefore)).toBeFalsy();
      expect(timeslotAfter.isBefore(timeslot)).toBeFalsy();
    });
  });

  describe('contains', () => {
    it('should check if another Range or Time is contained', () => {
      expect(Timeslot.fromString('09:00-11:00').contains(Time.fromString('09:00'))).toBe(true);
      expect(Timeslot.fromString('09:00-11:00').contains(Time.fromString('11:00'))).toBe(true);
      expect(Timeslot.fromString('09:00-11:00').contains(Time.fromString('10:00'))).toBe(true);
      expect(Timeslot.fromString('08:30-18:30').contains(Time.fromString('09:00'))).toBe(true);
      expect(Timeslot.fromString('09:00-11:00').contains(Time.fromString('08:00'))).toBe(false);

      expect(Timeslot.fromString('09:00-11:00').contains(Timeslot.fromString('09:00-11:00'))).toBe(true);
      expect(Timeslot.fromString('09:00-11:00').contains(Timeslot.fromString('08:00-10:00'))).toBe(false);
      expect(Timeslot.fromString('09:00-11:00').contains(Timeslot.fromString('10:00-12:00'))).toBe(false);
      expect(Timeslot.fromString('09:00-11:00').contains(Timeslot.fromString('09:00-13:00'))).toBe(false);
    });
  });

  describe('overlaps', () => {
    it('should check if another Timeslot overlaps', () => {
      expect(Timeslot.fromString('09:00-11:00').overlaps(Timeslot.fromString('09:00-11:00'))).toBe(true);
      expect(Timeslot.fromString('09:00-11:00').overlaps(Timeslot.fromString('09:00-12:00'))).toBe(true);
      expect(Timeslot.fromString('09:00-11:00').overlaps(Timeslot.fromString('08:00-12:00'))).toBe(true);
      expect(Timeslot.fromString('09:00-11:00').overlaps(Timeslot.fromString('08:00-10:00'))).toBe(true);

      expect(Timeslot.fromString('09:00-11:00').overlaps(Timeslot.fromString('08:00-09:00'))).toBe(false);
      expect(Timeslot.fromString('09:00-11:00').overlaps(Timeslot.fromString('11:00-12:00'))).toBe(false);
    });
  });

  describe('split', () => {
    it('should split a timeslots correctly', () => {
      const timeLimits = [Time.fromString('09:30'), Time.fromString('10:00'), Time.fromString('10:30')];
      const timeSlot = Timeslot.fromString('09:00-11:00');
      const timeslots = Timeslot.split(timeSlot, timeLimits);
      expect(timeslots[0].toString()).toStrictEqual('09:00-09:30');
      expect(timeslots[1].toString()).toStrictEqual('09:30-10:00');
      expect(timeslots[2].toString()).toStrictEqual('10:00-10:30');
      expect(timeslots[3].toString()).toStrictEqual('10:30-11:00');
    });
  });

  describe('mergeTimeslotIntersection', () => {
    it('should merge timeslots correctly', () => {
      const timeslot = Timeslot.fromString('06:00-11:00');
      const timeslot2 = Timeslot.fromString('10:00-11:00');
      const [merged, rest] = Timeslot.mergeTimeslotIntersection(timeslot, timeslot2);
      const [merged2, rest2] = Timeslot.mergeTimeslotIntersection(timeslot2, timeslot);
      expect(
        rest.find((timeslot) => timeslot.equals(new Timeslot([Time.fromString('06:00'), Time.fromString('10:00')]))),
      ).toBeTruthy();
      expect(
        rest2.find((timeslot) => timeslot.equals(new Timeslot([Time.fromString('06:00'), Time.fromString('10:00')]))),
      ).toBeTruthy();
      expect(merged.toString()).toStrictEqual('10:00-11:00');
      expect(merged2.toString()).toStrictEqual('10:00-11:00');
    });

    it('should throw an error if timeslots do not intersect', () => {
      const timeslot = Timeslot.fromString('06:00-11:00');
      const timeslot2 = Timeslot.fromString('11:00-12:00');
      expect(() => Timeslot.mergeTimeslotIntersection(timeslot, timeslot2)).toThrowError();
    });

    it('should return all the rest timeslots', () => {
      const timeslot = Timeslot.fromString('06:00-11:00');
      const timeslot2 = Timeslot.fromString('08:00-10:00');

      const [merged, rest] = Timeslot.mergeTimeslotIntersection(timeslot, timeslot2);
      expect(rest.length).toStrictEqual(2);
      expect(
        rest.find((timeslot) => timeslot.equals(new Timeslot([Time.fromString('06:00'), Time.fromString('08:00')]))),
      ).toBeTruthy();
      expect(
        rest.find((timeslot) => timeslot.equals(new Timeslot([Time.fromString('10:00'), Time.fromString('11:00')]))),
      ).toBeTruthy();
    });
  });
});
