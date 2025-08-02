import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidPagination } from '../validators/custom.validator';

export class BaseFilterDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @IsValidPagination({ message: 'Page must be between 1 and 100' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;
}

export class BaseIdDto {
  @IsInt({ message: 'ID must be an integer' })
  @Min(1, { message: 'ID must be a positive integer' })
  id: number;
}

export class BaseResponseDto<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp: Date;

  constructor(data?: T, message?: string, success: boolean = true) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.timestamp = new Date();
  }
}