import { TimeslotSerie } from '../timeslot-serie';
import { Time } from '../time';
import { Timeslot } from '../timeslot';

describe('TimeslotSerie class', () => {
  const timeslotSerie = TimeslotSerie.fromString('08:30-10:30,06:30-07:30');

  describe('has', () => {
    it('should return true if a Range is in a Day', () => {
      expect(timeslotSerie.has(Timeslot.fromString('08:30-10:30'))).toBe(true);
    });
    it('should return false if a Range is not in a Day', () => {
      expect(timeslotSerie.has(Timeslot.fromString('08:30-11:30'))).toBe(false);
    });
  });

  describe('set', () => {
    test('can set ranges', () => {
      const rangeSet = Timeslot.fromString('14:30-15:30');
      const serieSet = new TimeslotSerie(timeslotSerie).set(rangeSet);
      expect(serieSet.has(rangeSet)).toBeTruthy();
    });
  });

  describe('delete', () => {
    it('can delete ranges', () => {
      const rangeSet = Timeslot.fromString('14:30-15:30');
      const serieSet = new TimeslotSerie(timeslotSerie).set(rangeSet);
      serieSet.delete(rangeSet.toString());
      expect(serieSet.has(rangeSet)).toBeFalsy();
    });
  });

  describe('replace', () => {
    it('should replace a Range with another Range', () => {
      const rangeSet = Timeslot.fromString('14:30-15:30');
      const rangeReplace = Timeslot.fromString('15:30-16:30');
      const rangeReplaceSame = Timeslot.fromString('15:30-16:30');
      const serieSet = new TimeslotSerie(timeslotSerie).set(rangeSet);

      expect(serieSet.has(rangeSet)).toBeTruthy();
      expect(serieSet.replace(rangeSet.toString(), rangeReplace).has(rangeReplace)).toBeTruthy();
      expect(serieSet.replace(rangeReplaceSame.toString(), rangeReplace).has(rangeReplace)).toBeTruthy();
    });
  });

  describe('contains', () => {
    const testChain = TimeslotSerie.fromString('08:30-10:30,13:00-18:30');
    const testErrorChain = TimeslotSerie.fromString('13:00-18:30,19:00-20:00');

    const data = [
      Time.fromString('08:30'),
      Time.fromString('09:00'),
      Time.fromString('09:30'),
      Time.fromString('10:30'),
      Timeslot.fromString('08:30-10:30'),
      Timeslot.fromString('09:00-10:00'),
      Timeslot.fromString('09:15-10:00'),
      Timeslot.fromString('08:45-10:00'),
    ];

    it.each(data)(
      `should return true or the containing range if %s is contained in ${testChain.toString()}`,
      (range) => {
        const extracted = testChain.contains(range, true);

        expect(extracted?.contains(range)).toBe(true);
        expect(testChain.contains(range)).toBe(true);
      },
    );

    it.each(data)(
      `should return false or null range if %s is not contained in ${testErrorChain.toString()}`,
      (range) => {
        const extracted = testErrorChain.contains(range, true);

        expect(extracted).toBe(null);
        expect(testErrorChain.contains(range)).toBe(false);
      },
    );
  });

  describe('fromArray', () => {
    it('should create an instance from an array', () => {
      expect(TimeslotSerie.fromArray([Timeslot.fromString('07:30-08:30'), '08:30-10:30'])).toBeDefined();

      expect(TimeslotSerie.fromArray(['07:30-08:30', '08:30-10:30'])).toBeDefined();
    });
  });

  describe('getEmptyTimeslots', () => {
    const timeslotsEmpty = timeslotSerie.getEmptyTimeslots().map((timeslot) => timeslot.toString());
    //extendedMode set to false
    const timeslotsNotEmpty = [...timeslotSerie.keys()];
    expect(timeslotsNotEmpty.every((timeslotNotEmpty) => !timeslotsEmpty.includes(timeslotNotEmpty))).toBeTruthy();

    // extendedMode set to true
    const timeslotsEmpty2 = timeslotSerie.getEmptyTimeslots(true).map((timeslot) => timeslot.toString());
    const timeslotEmpty1 = Timeslot.fromString('00:00-06:30');
    const timeslotEmpty2 = Timeslot.fromString('10:30-23:59');
    expect(timeslotsEmpty2.some((timeslotEmpty) => timeslotsEmpty.includes(timeslotEmpty))).toBeTruthy();

    // Check if the extended mode contains the empty timeslots form the normal mode

    expect(timeslotsEmpty2.includes(timeslotEmpty1.toString())).toBeTruthy();
    expect(timeslotsEmpty2.includes(timeslotEmpty2.toString())).toBeTruthy();
  });

  describe('overlapsWith', () => {
    it('should return true if a TimeslotSerie overlaps with another', () => {
      const timeslot = Timeslot.fromString('06:30-08:30');
      const timeslot2 = Timeslot.fromString('00:00-06:30');
      const timeslot3 = Timeslot.fromString('10:30-23:59');
      const timeslot4 = Timeslot.fromString('07:30-08:30');

      expect(timeslotSerie.overlapsWith(timeslot)).toBeTruthy();

      expect(timeslotSerie.overlapsWith(timeslot2)).toBeFalsy();
      expect(timeslotSerie.overlapsWith(timeslot3)).toBeFalsy();
      expect(timeslotSerie.overlapsWith(timeslot4)).toBeFalsy();
    });
  });

  describe('toLocalString', () => {
    it('should return a string representation of the TimeslotSerie', () => {
      expect(timeslotSerie.toLocalString()).toBe('06:30-07:30,08:30-10:30');
    });
  });
});
