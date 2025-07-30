import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { BulkAssociationDto } from '../../modules/employee/dto/bulk-association.dto';

export function IsUniqueAssociation(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUniqueAssociation',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!Array.isArray(value)) return false;

          const associations = value;
          const seen = new Set<string>();

          for (const association of associations) {
            if (!association.employeeId || !Array.isArray(association.documentTypeIds)) {
              continue;
            }

            for (const documentTypeId of association.documentTypeIds) {
              const key = `${association.employeeId}-${documentTypeId}`;
              if (seen.has(key)) {
                return false;
              }
              seen.add(key);
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Duplicate employee-document type associations found in the request';
        },
      },
    });
  };
}