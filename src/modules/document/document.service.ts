import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import { DocumentFilterDto } from './dto/document-filter.dto';
import { Document, DocumentStatus } from '@prisma/client';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async submitDocument(employeeId: number, createDocumentDto: CreateDocumentDto): Promise<Document> {
    const { documentTypeId, name } = createDocumentDto;

    await this.validateEmployee(employeeId);
    await this.validateDocumentType(documentTypeId);
    await this.validateAssociation(employeeId, documentTypeId);
    await this.checkExistingDocument(employeeId, documentTypeId);
    await this.validateDocumentName(name, employeeId, documentTypeId);

    return this.prisma.document.create({
      data: {
        name,
        employeeId,
        documentTypeId,
        status: DocumentStatus.SENT,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async resubmitDocument(employeeId: number, documentTypeId: number, createDocumentDto: CreateDocumentDto): Promise<Document> {
    await this.validateEmployee(employeeId);
    await this.validateDocumentType(documentTypeId);
    await this.validateAssociation(employeeId, documentTypeId);

    const existingDocument = await this.prisma.document.findUnique({
      where: {
        employeeId_documentTypeId: {
          employeeId,
          documentTypeId,
        },
      },
    });

    if (!existingDocument) {
      throw new NotFoundException('No existing document found to resubmit');
    }

    if (existingDocument.status === DocumentStatus.SENT) {
      throw new ConflictException('Cannot resubmit a document that is already sent. Delete the existing document first.');
    }

    await this.validateDocumentName(createDocumentDto.name, employeeId, documentTypeId, existingDocument.id);

    return this.prisma.document.update({
      where: { id: existingDocument.id },
      data: {
        name: createDocumentDto.name,
        status: DocumentStatus.SENT,
        sentAt: new Date(),
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateDocumentStatus(id: number, updateStatusDto: UpdateDocumentStatusDto): Promise<Document> {
    const document = await this.findById(id);

    if (document.status === updateStatusDto.status) {
      throw new BadRequestException(`Document is already in ${updateStatusDto.status} status`);
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        sentAt: updateStatusDto.status === DocumentStatus.SENT ? new Date() : document.sentAt,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getEmployeeDocuments(employeeId: number) {
    await this.validateEmployee(employeeId);

    const documents = await this.prisma.document.findMany({
      where: { employeeId },
      include: {
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      employee,
      documents: documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        status: doc.status,
        documentType: doc.documentType,
        sentAt: doc.sentAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
    };
  }

  async getAllDocuments(filterDto: DocumentFilterDto) {
    const where: any = {};

    if (filterDto.employeeId) {
      where.employeeId = filterDto.employeeId;
    }

    if (filterDto.documentTypeId) {
      where.documentTypeId = filterDto.documentTypeId;
    }

    if (filterDto.status) {
      where.status = filterDto.status;
    }

    const documents = await this.prisma.document.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { sentAt: 'desc' },
      ],
    });

    return {
      documents: documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        status: doc.status,
        employee: doc.employee,
        documentType: doc.documentType,
        sentAt: doc.sentAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      summary: {
        total: documents.length,
        sent: documents.filter(doc => doc.status === DocumentStatus.SENT).length,
        pending: documents.filter(doc => doc.status === DocumentStatus.PENDING).length,
      },
    };
  }

  async getDocumentsByStatus(status: DocumentStatus) {
    const documents = await this.prisma.document.findMany({
      where: { status },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        sentAt: status === DocumentStatus.SENT ? 'desc' : 'asc',
      },
    });

    return {
      status,
      count: documents.length,
      documents: documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        employee: doc.employee,
        documentType: doc.documentType,
        sentAt: doc.sentAt,
        createdAt: doc.createdAt,
      })),
    };
  }

  async findById(id: number): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async removeDocument(id: number): Promise<void> {
    await this.findById(id);

    await this.prisma.document.delete({
      where: { id },
    });
  }

  async checkDuplicateSubmission(employeeId: number, documentTypeId: number): Promise<boolean> {
    const existingDocument = await this.prisma.document.findUnique({
      where: {
        employeeId_documentTypeId: {
          employeeId,
          documentTypeId,
        },
      },
    });

    return !!existingDocument;
  }

  private async validateEmployee(employeeId: number): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }
  }

  private async validateDocumentType(documentTypeId: number): Promise<void> {
    const documentType = await this.prisma.documentType.findUnique({
      where: { id: documentTypeId },
    });

    if (!documentType) {
      throw new NotFoundException(`Document type with ID ${documentTypeId} not found`);
    }
  }

  private async validateAssociation(employeeId: number, documentTypeId: number): Promise<void> {
    const association = await this.prisma.employeeDocumentType.findUnique({
      where: {
        employeeId_documentTypeId: {
          employeeId,
          documentTypeId,
        },
      },
    });

    if (!association) {
      throw new BadRequestException(
        `Employee is not required to submit this document type. Please associate the employee with the document type first.`
      );
    }
  }

  private async checkExistingDocument(employeeId: number, documentTypeId: number): Promise<void> {
    const existingDocument = await this.prisma.document.findUnique({
      where: {
        employeeId_documentTypeId: {
          employeeId,
          documentTypeId,
        },
      },
    });

    if (existingDocument) {
      const documentType = await this.prisma.documentType.findUnique({
        where: { id: documentTypeId },
      });

      throw new ConflictException({
        message: `Employee has already submitted a document for this document type`,
        details: {
          existingDocument: {
            id: existingDocument.id,
            name: existingDocument.name,
            status: existingDocument.status,
            sentAt: existingDocument.sentAt,
          },
          documentType: documentType?.name,
          suggestion: existingDocument.status === DocumentStatus.PENDING 
            ? 'You can update the existing pending document or delete it first'
            : 'Delete the existing document first if you need to submit a new one',
        },
      });
    }
  }

  private async validateDocumentName(name: string, employeeId: number, documentTypeId: number, excludeDocumentId?: number): Promise<void> {
    const where: any = {
      employeeId,
      name,
    };

    if (excludeDocumentId) {
      where.id = { not: excludeDocumentId };
    }

    const duplicateName = await this.prisma.document.findFirst({
      where,
      include: {
        documentType: {
          select: {
            name: true,
          },
        },
      },
    });

    if (duplicateName) {
      throw new ConflictException(
        `A document with the name "${name}" already exists for this employee (${duplicateName.documentType.name})`
      );
    }
  }
}