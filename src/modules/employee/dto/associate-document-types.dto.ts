import { IsArray, IsInt, ArrayNotEmpty, ArrayUnique, ArrayMinSize, ArrayMaxSize, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsPositiveNumber } from '../../../common/validators/custom.validator';

export class AssociateDocumentTypesDto {
  @IsArray({ message: 'Document type IDs must be an array' })
  @ArrayNotEmpty({ message: 'At least one document type ID is required' })
  @ArrayMinSize(1, { message: 'At least one document type ID is required' })
  @ArrayMaxSize(20, { message: 'Maximum 20 document types can be associated at once' })
  @ArrayUnique({ message: 'Document type IDs must be unique' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'Each document type ID must be an integer' })
  @Min(1, { each: true, message: 'Each document type ID must be a positive integer' })
  @IsPositiveNumber({ each: true, message: 'Each document type ID must be greater than 0' })
  documentTypeIds: number[];
}