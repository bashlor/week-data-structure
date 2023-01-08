import { DayType } from './date.type';
import { Day } from '../day';
import { TimeslotSerializable } from './timeslot.type';

export type WeekSerializable = Record<DayType, TimeslotSerializable[]>;
export type WeekParsable = Partial<Record<DayType, TimeslotSerializable[]>>;

export type WeekTuple = [
  sunday: Day<unknown>,
  monday: Day<unknown>,
  tuesday: Day<unknown>,
  wednesday: Day<unknown>,
  thursday: Day<unknown>,
  friday: Day<unknown>,
  saturday: Day<unknown>,
];
