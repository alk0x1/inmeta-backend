import { IsString, IsOptional, IsDateString, Length } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Length(11, 11, { message: 'Document must be exactly 11 characters' })
  document?: string;

  @IsOptional()
  @IsDateString()
  hiredAt?: string;
}