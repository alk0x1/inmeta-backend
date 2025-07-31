import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsDocumentNotDuplicate', async: false })
@Injectable()
export class IsDocumentNotDuplicateConstraint implements ValidatorConstraintInterface {
  validate(documentTypeId: number, args: ValidationArguments) {
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Document already exists for this employee and document type';
  }
}

export function IsDocumentNotDuplicate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDocumentNotDuplicateConstraint,
    });
  };
}