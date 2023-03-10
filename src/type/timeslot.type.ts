import { TimeSerializable } from './time.type';
import { Timeslot } from '../timeslot';
import { Time } from '../time';

export interface TimeslotSerializable {
  start: TimeSerializable;
  end: TimeSerializable;
}

export interface TimeslotSeriesOptions {
  allowTimeslotMerging?: boolean;
  defaultStartLimit?: Time;
  defaultEndLimit?: Time;
  enforceOverlappingCheck?: boolean;
}

export function isSlotAvailable(slot: Timeslot, range: Timeslot, allowedMinutesOverflow: number): boolean {
  return range.end.add(allowedMinutesOverflow).compareTo(slot.end) >= 0;
}
