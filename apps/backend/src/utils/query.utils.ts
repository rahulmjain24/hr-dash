const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

export function startOf(value: string): Date {
  return new Date(value);
}

export function endOfExclusive(value: string): Date {
  const date = new Date(value);
  if (DATE_ONLY.test(value)) {
    date.setUTCDate(date.getUTCDate() + 1);
  } else {
    date.setMilliseconds(date.getMilliseconds() + 1);
  }
  return date;
}

export function isActiveFilter() {
  return { $or: [{ isActive: true }, { isActive: null }] };
}
