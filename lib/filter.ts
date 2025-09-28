export function isNumber(val: unknown): val is number {
  return Number.isInteger(val);
}
