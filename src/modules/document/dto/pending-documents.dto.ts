import { IsOptional, IsInt, IsString, IsEnum, IsArray, IsDateString, Min, Max, Length } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsValidPagination, IsPositiveNumber } from '../../../common/validators/custom.validator';

export enum PendingDocumentsSortBy {
  EMPLOYEE_NAME = 'employeeName',
  DOCUMENT_TYPE = 'documentTypeName',
  DAYS_PENDING = 'daysPending',
  PRIORITY = 'priority',
  PENDING_SINCE = 'pendingSince',
  HIRED_AT = 'hiredAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class PendingDocumentsFilterDto {
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

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Employee ID must be an integer' })
  @IsPositiveNumber({ message: 'Employee ID must be a positive number' })
  employeeId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Document type ID must be an integer' })
  @IsPositiveNumber({ message: 'Document type ID must be a positive number' })
  documentTypeId?: number;

  @IsOptional()
  @IsArray({ message: 'Employee IDs must be an array' })
  @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
  @IsInt({ each: true, message: 'Each employee ID must be an integer' })
  @IsPositiveNumber({ each: true, message: 'Each employee ID must be a positive number' })
  employeeIds?: number[];

  @IsOptional()
  @IsArray({ message: 'Document type IDs must be an array' })
  @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
  @IsInt({ each: true, message: 'Each document type ID must be an integer' })
  @IsPositiveNumber({ each: true, message: 'Each document type ID must be a positive number' })
  documentTypeIds?: number[];

  @IsOptional()
  @IsString({ message: 'Employee name must be a string' })
  @Length(2, 100, { message: 'Employee name must be between 2 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  employeeName?: string;

  @IsOptional()
  @IsString({ message: 'Document type name must be a string' })
  @Length(2, 50, { message: 'Document type name must be between 2 and 50 characters' })
  @Transform(({ value }) => value?.trim())
  documentTypeName?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Minimum days pending must be an integer' })
  @Min(0, { message: 'Minimum days pending cannot be negative' })
  @Max(365, { message: 'Minimum days pending cannot exceed 365 days' })
  minDaysPending?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Maximum days pending must be an integer' })
  @Min(0, { message: 'Maximum days pending cannot be negative' })
  @Max(365, { message: 'Maximum days pending cannot exceed 365 days' })
  maxDaysPending?: number;

  @IsOptional()
  @IsString({ message: 'Priority must be a string' })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'], { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsOptional()
  @IsDateString({}, { message: 'Hired after date must be a valid date string' })
  hiredAfter?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Hired before date must be a valid date string' })
  hiredBefore?: string;

  @IsOptional()
  @IsEnum(PendingDocumentsSortBy, { message: 'Invalid sort field' })
  sortBy?: PendingDocumentsSortBy = PendingDocumentsSortBy.PRIORITY;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be asc or desc' })
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class PendingDocumentItem {
  employeeId: number;
  employeeName: string;
  employeeDocument: string;
  employeeHiredAt: Date;
  documentTypeId: number;
  documentTypeName: string;
  pendingSince: Date;
  daysPending: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class PendingDocumentsResponseDto {
  data: PendingDocumentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalPendingDocuments: number;
    uniqueEmployees: number;
    averageDaysPending: number;
    priorityBreakdown: {
      high: number;
      medium: number;
      low: number;
    };
  };
  appliedFilters: {
    [key: string]: any;
  };
}