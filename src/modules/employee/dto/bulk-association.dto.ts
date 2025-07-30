import { IsArray, IsInt, ArrayNotEmpty, ArrayUnique, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
  associations: EmployeeDocumentTypeAssociation[];
}