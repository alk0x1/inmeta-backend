import { DocumentStatus } from '@prisma/client';

export class DocumentStatusItem {
  documentTypeId: number;
  documentTypeName: string;
  status: 'SENT' | 'PENDING';
  documentId?: number;
  documentName?: string;
  sentAt?: Date;
  pendingSince: Date;
}

export class EmployeeDocumentationStatusDto {
  employeeId: number;
  employeeName: string;
  totalRequired: number;
  totalSent: number;
  totalPending: number;
  completionPercentage: number;
  documents: DocumentStatusItem[];
  summary: {
    isComplete: boolean;
    nextActions: string[];
  };
}