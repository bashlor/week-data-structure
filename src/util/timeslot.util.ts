import { Timeslot } from '../timeslot';

export function compareRanges(a: Timeslot, b: Timeslot): number {
  return a.compareTo(b);
}
