import { DayType } from './date.type';
import { TimeslotSerializable } from './timeslot.type';

export interface DaySerializable {
  dayOfWeek: DayType;
  timeslots: TimeslotSerializable[];
}

export interface DayToStringOptions {
  includeDay?: boolean;
}

export type DayParsable = Partial<DaySerializable>;
