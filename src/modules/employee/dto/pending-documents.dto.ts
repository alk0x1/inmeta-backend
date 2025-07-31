import { IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class PendingDocumentsFilterDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  employeeId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  documentTypeId?: number;
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
}