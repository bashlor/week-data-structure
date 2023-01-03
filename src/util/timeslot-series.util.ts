import { Timeslot } from '../timeslot';
import { TimeslotSerializable } from '../type/timeslot.type';

export function mapToTimeslotSerieTuple(item: string | Timeslot | TimeslotSerializable): readonly [string, Timeslot] {
  const range = typeof item === 'string' ? Timeslot.fromString(item) : new Timeslot(item);

  return [range.toString(), range] as const;
}
