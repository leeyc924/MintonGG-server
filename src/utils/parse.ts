export function parseToNumber<T>(value: T, defaultValue = 0): number {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return defaultValue;
  }

  return parsed;
}
