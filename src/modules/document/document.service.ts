import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
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
      throw new ConflictException(
        `Employee has already submitted a document for this document type`
      );
    }
  }
}