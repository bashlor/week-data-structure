const dayEnumObject = {
  monday: 'monday',
  tuesday: 'tuesday',
  wednesday: 'wednesday',
  thursday: 'thursday',
  friday: 'friday',
  saturday: 'saturday',
  sunday: 'sunday',
};

export enum DayTypeEnum {
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
  sunday,
}

export type DayType = keyof typeof dayEnumObject;

export const DayLabels = Object.keys(dayEnumObject) as Array<DayType>;
