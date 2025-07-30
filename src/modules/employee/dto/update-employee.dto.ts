import { IsString, IsOptional, IsDateString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsCPF } from '../../../common/validators/cpf.validator';
import { IsNotFutureDate } from '../../../common/validators/date.validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, { message: 'Name must contain only letters and spaces' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.replace(/[^\d]/g, ''))
  @Length(11, 11, { message: 'Document must be exactly 11 digits' })
  @IsCPF({ message: 'Invalid CPF format' })
  document?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format. Use YYYY-MM-DD' })
  @IsNotFutureDate()
  hiredAt?: string;
}