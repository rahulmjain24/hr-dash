/** Splits on any whitespace and drops empty parts. */
export function splitWords(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}

/** "https://example.com//" -> "https://example.com" */
export function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}
