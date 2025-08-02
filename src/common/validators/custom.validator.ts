import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsPositiveNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPositiveNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'number' && value > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a positive number`;
        },
      },
    });
  };
}

export function IsValidPagination(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidPagination',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'number') return false;
          return value >= 1 && value <= 100;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be between 1 and 100`;
        },
      },
    });
  };
}

export function IsValidEmployeeName(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidEmployeeName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          const trimmedValue = value.trim();
          if (trimmedValue.length < 2 || trimmedValue.length > 100) return false;
          
          const namePattern = /^[a-zA-ZÀ-ÿ\s'.-]+$/;
          return namePattern.test(trimmedValue);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Employee name must contain only letters, spaces, apostrophes, periods, and hyphens';
        },
      },
    });
  };
}

export function IsBusinessDay(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBusinessDay',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true;
          
          const date = new Date(value);
          const dayOfWeek = date.getDay();
          return dayOfWeek >= 1 && dayOfWeek <= 5;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Date must be a business day (Monday to Friday)';
        },
      },
    });
  };
}