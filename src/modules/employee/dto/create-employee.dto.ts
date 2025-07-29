import { IsString, IsNotEmpty, IsDateString, Length } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'Document must be exactly 11 characters' })
  document: string;

  @IsDateString()
  hiredAt: string;
}