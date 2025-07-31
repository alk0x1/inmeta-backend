import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmployeeDocumentationStatusDto, DocumentStatusItem } from './dto/employee-documentation-status.dto';

@Injectable()
export class EmployeeDocumentationStatusService {
  constructor(private prisma: PrismaService) {}

  async getEmployeeDocumentationStatus(employeeId: number): Promise<EmployeeDocumentationStatusDto> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const requiredDocumentTypes = await this.prisma.employeeDocumentType.findMany({
      where: { employeeId },
      include: {
        documentType: true,
      },
      orderBy: {
        documentType: {
          name: 'asc',
        },
      },
    });

    const submittedDocuments = await this.prisma.document.findMany({
      where: { employeeId },
      include: {
        documentType: true,
      },
    });

    const documentStatusItems: DocumentStatusItem[] = requiredDocumentTypes.map(required => {
      const submitted = submittedDocuments.find(
        doc => doc.documentTypeId === required.documentTypeId
      );

      if (submitted) {
        return {
          documentTypeId: required.documentTypeId,
          documentTypeName: required.documentType.name,
          status: 'SENT',
          documentId: submitted.id,
          documentName: submitted.name,
          sentAt: submitted.sentAt,
          pendingSince: required.createdAt,
        };
      } else {
        return {
          documentTypeId: required.documentTypeId,
          documentTypeName: required.documentType.name,
          status: 'PENDING',
          pendingSince: required.createdAt,
        };
      }
    });

    const totalRequired = documentStatusItems.length;
    const totalSent = documentStatusItems.filter(item => item.status === 'SENT').length;
    const totalPending = totalRequired - totalSent;
    const completionPercentage = totalRequired > 0 ? Math.round((totalSent / totalRequired) * 100) : 100;

    const isComplete = totalPending === 0;
    const nextActions = this.generateNextActions(documentStatusItems, isComplete);

    return {
      employeeId,
      employeeName: employee.name,
      totalRequired,
      totalSent,
      totalPending,
      completionPercentage,
      documents: documentStatusItems,
      summary: {
        isComplete,
        nextActions,
      },
    };
  }

  async getMultipleEmployeesDocumentationStatus(employeeIds: number[]) {
    const results = [];
    const errors = [];

    for (const employeeId of employeeIds) {
      try {
        const status = await this.getEmployeeDocumentationStatus(employeeId);
        results.push(status);
      } catch (error) {
        errors.push({
          employeeId,
          error: error.message,
        });
      }
    }

    return {
      results,
      errors,
      summary: {
        total: employeeIds.length,
        successful: results.length,
        failed: errors.length,
        averageCompletion: results.length > 0 
          ? Math.round(results.reduce((sum, r) => sum + r.completionPercentage, 0) / results.length)
          : 0,
      },
    };
  }

  async getEmployeesWithIncompleteDocumentation() {
    const allEmployees = await this.prisma.employee.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const incompleteEmployees = [];

    for (const employee of allEmployees) {
      const status = await this.getEmployeeDocumentationStatus(employee.id);
      if (!status.summary.isComplete) {
        incompleteEmployees.push({
          employeeId: employee.id,
          employeeName: employee.name,
          totalRequired: status.totalRequired,
          totalPending: status.totalPending,
          completionPercentage: status.completionPercentage,
          pendingDocuments: status.documents
            .filter(doc => doc.status === 'PENDING')
            .map(doc => doc.documentTypeName),
        });
      }
    }

    return {
      incompleteEmployees,
      summary: {
        totalEmployees: allEmployees.length,
        incompleteCount: incompleteEmployees.length,
        completeCount: allEmployees.length - incompleteEmployees.length,
        overallCompletionRate: allEmployees.length > 0 
          ? Math.round(((allEmployees.length - incompleteEmployees.length) / allEmployees.length) * 100)
          : 100,
      },
    };
  }

  private generateNextActions(documents: DocumentStatusItem[], isComplete: boolean): string[] {
    if (isComplete) {
      return ['All required documents have been submitted'];
    }

    const pendingDocuments = documents.filter(doc => doc.status === 'PENDING');
    const actions = [];

    if (pendingDocuments.length > 0) {
      actions.push(`Submit the following documents: ${pendingDocuments.map(doc => doc.documentTypeName).join(', ')}`);
    }

    const oldestPending = pendingDocuments
      .sort((a, b) => a.pendingSince.getTime() - b.pendingSince.getTime())[0];

    if (oldestPending) {
      const daysPending = Math.floor((new Date().getTime() - oldestPending.pendingSince.getTime()) / (1000 * 60 * 60 * 24));
      if (daysPending > 7) {
        actions.push(`Priority: ${oldestPending.documentTypeName} has been pending for ${daysPending} days`);
      }
    }

    return actions;
  }
}