export function isInteger(val: unknown): val is number {
  return Number.isInteger(val);
}

export function isNotNullable<T>(val: T): val is NonNullable<T> {
  return val !== null && val !== undefined;
}
