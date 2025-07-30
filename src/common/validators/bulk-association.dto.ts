import { IsArray, IsInt, ArrayNotEmpty, ArrayUnique, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsUniqueAssociation } from '../../common/validators/unique-association.validator';

export class EmployeeDocumentTypeAssociation {
  @IsInt()
  employeeId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  documentTypeIds: number[];
}

export class BulkAssociationDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EmployeeDocumentTypeAssociation)
  @IsUniqueAssociation({ message: 'Duplicate employee-document type associations found' })
  associations: EmployeeDocumentTypeAssociation[];
}