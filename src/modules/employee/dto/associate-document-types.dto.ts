import { IsArray, IsInt, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { Type } from 'class-transformer';

export class AssociateDocumentTypesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  documentTypeIds: number[];
}