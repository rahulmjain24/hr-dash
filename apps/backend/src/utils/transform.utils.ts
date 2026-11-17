/** class-transformer `@Transform()` callbacks shared by the DTOs. */

type TransformInput = { value: unknown };

export const trim = ({ value }: TransformInput) =>
  typeof value === 'string' ? value.trim() : value;

/** Trims string values and turns blank ones into `undefined`, so `@IsOptional()` skips them. */
export const trimToUndefined = ({ value }: TransformInput) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};
