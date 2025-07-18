import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsDateTime(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsDateTime',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(datetime: string) {
          const regex = new RegExp(
            /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4} (0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/gm,
          );
          return regex.test(datetime);
        },
        defaultMessage(args: ValidationArguments) {
          return typeof args.value !== 'string'
            ? `${args.property} must be a string!`
            : `${args.property} is invalid!`;
        },
      },
    });
  };
}
