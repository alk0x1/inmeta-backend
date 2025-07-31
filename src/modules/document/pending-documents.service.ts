import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PendingDocumentsFilterDto, PendingDocumentItem, PendingDocumentsResponseDto } from '../employee/dto/pending-documents.dto';

@Injectable()
export class PendingDocumentsService {
  constructor(private prisma: PrismaService) {}

  async getPendingDocuments(filterDto: PendingDocumentsFilterDto): Promise<PendingDocumentsResponseDto> {
    const { page = 1, limit = 10, employeeId, documentTypeId } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (employeeId) {
      where.employeeId = employeeId;
    }
    
    if (documentTypeId) {
      where.documentTypeId = documentTypeId;
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
        employeeId: employeeId || undefined,
        documentTypeId: documentTypeId || undefined,
      },
      select: {
        employeeId: true,
        documentTypeId: true,
      },
    });

    const submittedSet = new Set(
      submittedDocuments.map(doc => `${doc.employeeId}-${doc.documentTypeId}`)
    );

    const pendingDocuments = requiredDocuments
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
      })
      .sort((a, b) => {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.daysPending - a.daysPending;
      });

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

  private calculatePriority(daysPending: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (daysPending >= 30) return 'HIGH';
    if (daysPending >= 14) return 'MEDIUM';
    return 'LOW';
  }
}