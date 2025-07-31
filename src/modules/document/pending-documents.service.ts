import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PendingDocumentsFilterDto, PendingDocumentItem, PendingDocumentsResponseDto, PendingDocumentsSortBy, SortOrder } from './dto/pending-documents.dto';

@Injectable()
export class PendingDocumentsService {
  constructor(private prisma: PrismaService) {}

  async getPendingDocuments(filterDto: PendingDocumentsFilterDto): Promise<PendingDocumentsResponseDto> {
    const { 
      page = 1, 
      limit = 10, 
      employeeId, 
      documentTypeId,
      employeeIds,
      documentTypeIds,
      employeeName,
      documentTypeName,
      minDaysPending,
      maxDaysPending,
      priority,
      hiredAfter,
      hiredBefore,
      sortBy = PendingDocumentsSortBy.PRIORITY,
      sortOrder = SortOrder.DESC
    } = filterDto;

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (employeeId) {
      where.employeeId = employeeId;
    }
    
    if (employeeIds && employeeIds.length > 0) {
      where.employeeId = { in: employeeIds };
    }
    
    if (documentTypeId) {
      where.documentTypeId = documentTypeId;
    }
    
    if (documentTypeIds && documentTypeIds.length > 0) {
      where.documentTypeId = { in: documentTypeIds };
    }

    if (employeeName) {
      where.employee = {
        name: {
          contains: employeeName,
          mode: 'insensitive',
        },
      };
    }

    if (documentTypeName) {
      where.documentType = {
        name: {
          contains: documentTypeName,
          mode: 'insensitive',
        },
      };
    }

    if (hiredAfter || hiredBefore) {
      where.employee = {
        ...where.employee,
        hiredAt: {},
      };
      
      if (hiredAfter) {
        where.employee.hiredAt.gte = new Date(hiredAfter);
      }
      
      if (hiredBefore) {
        where.employee.hiredAt.lte = new Date(hiredBefore);
      }
    }

    const requiredDocuments = await this.prisma.employeeDocumentType.findMany({
      where,
      include: {
        employee: true,
        documentType: true,
      },
    });

    const submittedDocuments = await this.prisma.document.findMany({
      where: {
        employeeId: employeeId || (employeeIds?.length ? { in: employeeIds } : undefined),
        documentTypeId: documentTypeId || (documentTypeIds?.length ? { in: documentTypeIds } : undefined),
      },
      select: {
        employeeId: true,
        documentTypeId: true,
      },
    });

    const submittedSet = new Set(
      submittedDocuments.map(doc => `${doc.employeeId}-${doc.documentTypeId}`)
    );

    let pendingDocuments = requiredDocuments
      .filter(required => 
        !submittedSet.has(`${required.employeeId}-${required.documentTypeId}`)
      )
      .map(required => {
        const daysPending = Math.floor(
          (new Date().getTime() - required.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          employeeId: required.employeeId,
          employeeName: required.employee.name,
          employeeDocument: required.employee.document,
          employeeHiredAt: required.employee.hiredAt,
          documentTypeId: required.documentTypeId,
          documentTypeName: required.documentType.name,
          pendingSince: required.createdAt,
          daysPending,
          priority: this.calculatePriority(daysPending),
        };
      });

    pendingDocuments = this.applyFilters(pendingDocuments, {
      minDaysPending,
      maxDaysPending,
      priority,
    });

    pendingDocuments = this.applySorting(pendingDocuments, sortBy, sortOrder);

    const total = pendingDocuments.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = pendingDocuments.slice(skip, skip + limit);

    const uniqueEmployees = new Set(pendingDocuments.map(doc => doc.employeeId)).size;
    const averageDaysPending = pendingDocuments.length > 0
      ? Math.round(pendingDocuments.reduce((sum, doc) => sum + doc.daysPending, 0) / pendingDocuments.length)
      : 0;

    const priorityBreakdown = {
      high: pendingDocuments.filter(doc => doc.priority === 'HIGH').length,
      medium: pendingDocuments.filter(doc => doc.priority === 'MEDIUM').length,
      low: pendingDocuments.filter(doc => doc.priority === 'LOW').length,
    };

    const appliedFilters = this.getAppliedFilters(filterDto);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      summary: {
        totalPendingDocuments: total,
        uniqueEmployees,
        averageDaysPending,
        priorityBreakdown,
      },
      appliedFilters,
    };
  }

  async getPendingDocumentsByEmployee(employeeId: number) {
    const filterDto = new PendingDocumentsFilterDto();
    filterDto.employeeId = employeeId;
    filterDto.page = 1;
    filterDto.limit = 100;

    const result = await this.getPendingDocuments(filterDto);
    
    return {
      employeeId,
      pendingDocuments: result.data,
      summary: {
        totalPending: result.data.length,
        averageDaysPending: result.summary.averageDaysPending,
        priorityBreakdown: result.summary.priorityBreakdown,
      },
    };
  }

  async getPendingDocumentsByDocumentType(documentTypeId: number) {
    const filterDto = new PendingDocumentsFilterDto();
    filterDto.documentTypeId = documentTypeId;
    filterDto.page = 1;
    filterDto.limit = 100;

    const result = await this.getPendingDocuments(filterDto);
    
    return {
      documentTypeId,
      pendingDocuments: result.data,
      summary: {
        totalPending: result.data.length,
        uniqueEmployees: result.summary.uniqueEmployees,
        averageDaysPending: result.summary.averageDaysPending,
        priorityBreakdown: result.summary.priorityBreakdown,
      },
    };
  }

  async getPendingDocumentsReport() {
    const allPending = await this.getPendingDocuments({ page: 1, limit: 1000 });
    
    // Define interfaces for better type safety
    interface EmployeeStats {
      employeeName: string;
      pendingCount: number;
      pendingDocuments: string[];
    }

    interface DocumentTypeStats {
      documentTypeName: string;
      pendingCount: number;
      affectedEmployees: Set<number>;
    }

    const employeeStats: Record<number, EmployeeStats> = {};
    const documentTypeStats: Record<number, DocumentTypeStats> = {};

    allPending.data.forEach(pending => {
      if (!employeeStats[pending.employeeId]) {
        employeeStats[pending.employeeId] = {
          employeeName: pending.employeeName,
          pendingCount: 0,
          pendingDocuments: [],
        };
      }
      employeeStats[pending.employeeId].pendingCount++;
      employeeStats[pending.employeeId].pendingDocuments.push(pending.documentTypeName);

      if (!documentTypeStats[pending.documentTypeId]) {
        documentTypeStats[pending.documentTypeId] = {
          documentTypeName: pending.documentTypeName,
          pendingCount: 0,
          affectedEmployees: new Set(),
        };
      }
      documentTypeStats[pending.documentTypeId].pendingCount++;
      documentTypeStats[pending.documentTypeId].affectedEmployees.add(pending.employeeId);
    });

    return {
      overview: allPending.summary,
      byEmployee: Object.entries(employeeStats).map(([employeeId, stats]) => ({
        employeeId: parseInt(employeeId),
        employeeName: stats.employeeName,
        pendingCount: stats.pendingCount,
        pendingDocuments: stats.pendingDocuments,
      })),
      byDocumentType: Object.entries(documentTypeStats).map(([documentTypeId, stats]) => ({
        documentTypeId: parseInt(documentTypeId),
        documentTypeName: stats.documentTypeName,
        pendingCount: stats.pendingCount,
        affectedEmployees: stats.affectedEmployees.size,
      })),
      generatedAt: new Date(),
    };
  }

  private applyFilters(
    documents: PendingDocumentItem[], 
    filters: {
      minDaysPending?: number;
      maxDaysPending?: number;
      priority?: string;
    }
  ): PendingDocumentItem[] {
    let filtered = documents;

    if (filters.minDaysPending !== undefined) {
      filtered = filtered.filter(doc => doc.daysPending >= filters.minDaysPending);
    }

    if (filters.maxDaysPending !== undefined) {
      filtered = filtered.filter(doc => doc.daysPending <= filters.maxDaysPending);
    }

    if (filters.priority) {
      filtered = filtered.filter(doc => doc.priority === filters.priority);
    }

    return filtered;
  }

  private applySorting(
    documents: PendingDocumentItem[], 
    sortBy: PendingDocumentsSortBy, 
    sortOrder: SortOrder
  ): PendingDocumentItem[] {
    return documents.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case PendingDocumentsSortBy.EMPLOYEE_NAME:
          comparison = a.employeeName.localeCompare(b.employeeName);
          break;
        case PendingDocumentsSortBy.DOCUMENT_TYPE:
          comparison = a.documentTypeName.localeCompare(b.documentTypeName);
          break;
        case PendingDocumentsSortBy.DAYS_PENDING:
          comparison = a.daysPending - b.daysPending;
          break;
        case PendingDocumentsSortBy.PRIORITY:
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case PendingDocumentsSortBy.PENDING_SINCE:
          comparison = a.pendingSince.getTime() - b.pendingSince.getTime();
          break;
        case PendingDocumentsSortBy.HIRED_AT:
          comparison = a.employeeHiredAt.getTime() - b.employeeHiredAt.getTime();
          break;
        default:
          comparison = 0;
      }

      return sortOrder === SortOrder.ASC ? comparison : -comparison;
    });
  }

  private getAppliedFilters(filterDto: PendingDocumentsFilterDto): { [key: string]: any } {
    const applied = {};
    
    Object.keys(filterDto).forEach(key => {
      if (filterDto[key] !== undefined && filterDto[key] !== null && key !== 'page' && key !== 'limit') {
        applied[key] = filterDto[key];
      }
    });

    return applied;
  }

  private calculatePriority(daysPending: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (daysPending >= 30) return 'HIGH';
    if (daysPending >= 14) return 'MEDIUM';
    return 'LOW';
  }
}