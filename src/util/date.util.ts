export const stdTimezoneOffset = (value: Date): number => {
  const jan = new Date(value.getFullYear(), 0, 1);
  const jul = new Date(value.getFullYear(), 6, 1);

  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

export const isDstObserved = (value: Date): boolean => {
  return value.getTimezoneOffset() !== stdTimezoneOffset(value);
};
