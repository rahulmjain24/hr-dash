export function isEmptyObject(value: object): boolean {
  return Object.keys(value).length === 0;
}

export function omitUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
