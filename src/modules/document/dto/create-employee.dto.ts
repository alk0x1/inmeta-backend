import { IsString, IsNotEmpty, IsDateString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsCPF } from '../../../common/validators/cpf.validator';
import { IsNotFutureDate } from '../../../common/validators/date.validator';
import { IsValidEmployeeName, IsBusinessDay } from '../../../common/validators/custom.validator';

export class CreateEmployeeDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  @IsValidEmployeeName({ message: 'Name must contain only valid characters (letters, spaces, apostrophes, periods, hyphens)' })
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ' '))
  name: string;

  @IsString({ message: 'Document must be a string' })
  @IsNotEmpty({ message: 'Document is required' })
  @Transform(({ value }) => value?.replace(/[^\d]/g, ''))
  @Length(11, 11, { message: 'Document must be exactly 11 digits' })
  @Matches(/^\d{11}$/, { message: 'Document must contain only numbers' })
  @IsCPF({ message: 'Invalid CPF format or checksum' })
  document: string;

  @IsDateString({}, { message: 'Invalid date format. Use YYYY-MM-DD or ISO format' })
  @IsNotFutureDate({ message: 'Hired date cannot be in the future' })
  @IsBusinessDay({ message: 'Hired date should be a business day' })
  hiredAt: string;
}