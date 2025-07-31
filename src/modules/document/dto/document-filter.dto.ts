import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { DocumentStatus } from '@prisma/client';

export class DocumentFilterDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  employeeId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  documentTypeId?: number;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}