import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

/** `@IsUrl()` options that only accept absolute http(s) URLs. */
export const HTTP_URL_OPTIONS = {
  protocols: ['http', 'https'],
  require_protocol: true,
};

/**
 * Validates that a date property is on or after another date property of the same object.
 * Passes when either value is missing, so combine it with `@IsOptional()` / `@IsDate()`.
 */
export function IsOnOrAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isOnOrAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const related = (args.object as Record<string, unknown>)[
            args.constraints[0]
          ];
          if (!(value instanceof Date) || !(related instanceof Date))
            return true;
          return value.getTime() >= related.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be on or after ${args.constraints[0]}`;
        },
      },
    });
  };
}
