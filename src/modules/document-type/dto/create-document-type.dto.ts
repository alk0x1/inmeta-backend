import { IsString, IsNotEmpty, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidDocumentName } from '../../../common/validators/document-name.validator';

export class CreateDocumentTypeDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  @IsValidDocumentName()
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ' '))
  name: string;
}