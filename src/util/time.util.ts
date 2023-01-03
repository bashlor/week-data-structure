import { DAY_HOURS, HOUR_MINUTES } from '../constant/time.constant';
import {WeekManagerError} from "../error/week-manager.error";

export function computeMinutes(hours: number, minutes: number): number {
  if(typeof hours !== 'number' || hours < 0 || hours >= DAY_HOURS) throw new WeekManagerError(`Invalid hours value: ${hours}`,'Time');
  if(typeof minutes !== 'number' || minutes < 0 || minutes >= HOUR_MINUTES) throw new WeekManagerError(`Invalid minutes value: ${minutes}`,'Time');
  return hours * HOUR_MINUTES + minutes;
}

export function totalMinutesToTimeHours(num: number): number {
  if(typeof num !== 'number' || num < 0 || num >= DAY_HOURS * HOUR_MINUTES) throw new WeekManagerError(`Invalid minutes value: ${num}`,'Time');
  const hours = Math.floor(num / HOUR_MINUTES);
  return hours > DAY_HOURS ? hours % DAY_HOURS : hours;
}

export function totalMinutesToTimeMinutes(num: number): number {
    if(typeof num !== 'number' || num < 0 || num >= DAY_HOURS * HOUR_MINUTES) throw new WeekManagerError(`Invalid minutes value: ${num}`,'Time');
  return num % HOUR_MINUTES;
}
