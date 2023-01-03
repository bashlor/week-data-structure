import { DayType } from './date.type';
import { Day } from '../day';
import { TimeslotSerializable } from './timeslot.type';

export type WeekSerializable = Record<DayType, TimeslotSerializable[]>;
export type WeekParsable = Partial<Record<DayType, TimeslotSerializable[]>>;

export type WeekTuple = [
  sunday: Day,
  monday: Day,
  tuesday: Day,
  wednesday: Day,
  thursday: Day,
  friday: Day,
  saturday: Day,
];
