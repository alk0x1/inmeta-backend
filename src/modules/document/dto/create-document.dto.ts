import { IsString, IsNotEmpty, IsInt, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDocumentDto {
  @IsInt()
  documentTypeId: number;

  @IsString()
  @IsNotEmpty()
  @Length(3, 255, { message: 'Document name must be between 3 and 255 characters' })
  @Matches(/^[a-zA-Z0-9À-ÿ\s\-_.()]+\.[a-zA-Z]{2,5}$/, { 
    message: 'Document name must be a valid filename with extension' 
  })
  @Transform(({ value }) => value?.trim())
  name: string;
}