import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsValidDocumentName(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDocumentName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          const trimmedValue = value.trim();
          if (trimmedValue.length < 2 || trimmedValue.length > 50) return false;
          
          const validPattern = /^[a-zA-ZÀ-ÿ0-9\s\-_.()]+$/;
          return validPattern.test(trimmedValue);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Document name must contain only letters, numbers, spaces and basic punctuation (- _ . ())';
        },
      },
    });
  };
}