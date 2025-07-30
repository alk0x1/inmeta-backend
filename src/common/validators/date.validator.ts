import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true;
          const inputDate = new Date(value);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return inputDate <= today;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Hired date cannot be in the future';
        },
      },
    });
  };
}