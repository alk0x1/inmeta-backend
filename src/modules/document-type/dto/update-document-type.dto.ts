import { IsString, IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateDocumentTypeDto {
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;
}