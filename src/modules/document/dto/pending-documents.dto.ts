import { IsOptional, IsInt, IsString, IsEnum, IsArray, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  employeeId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  documentTypeId?: number;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
  @IsInt({ each: true })
  employeeIds?: number[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
  @IsInt({ each: true })
  documentTypeIds?: number[];

  @IsOptional()
  @IsString()
  employeeName?: string;

  @IsOptional()
  @IsString()
  documentTypeName?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  minDaysPending?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  maxDaysPending?: number;

  @IsOptional()
  @IsString()
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsOptional()
  @IsDateString()
  hiredAfter?: string;

  @IsOptional()
  @IsDateString()
  hiredBefore?: string;

  @IsOptional()
  @IsEnum(PendingDocumentsSortBy)
  sortBy?: PendingDocumentsSortBy = PendingDocumentsSortBy.PRIORITY;

  @IsOptional()
  @IsEnum(SortOrder)
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