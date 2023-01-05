/* eslint-disable  @typescript-eslint/no-explicit-any */
export function parseIntegerOrThrow(value: any,error:Error): number {
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw error;
  }
  return num;
}
