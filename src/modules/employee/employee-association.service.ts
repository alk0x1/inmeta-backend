import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssociateDocumentTypesDto } from './dto/associate-document-types.dto';

@Injectable()
export class EmployeeAssociationService {
  constructor(private prisma: PrismaService) {}

  async associateDocumentTypes(employeeId: number, dto: AssociateDocumentTypesDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const documentTypes = await this.prisma.documentType.findMany({
      where: { id: { in: dto.documentTypeIds } },
    });

    if (documentTypes.length !== dto.documentTypeIds.length) {
      const foundIds = documentTypes.map(dt => dt.id);
      const missingIds = dto.documentTypeIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Document types not found: ${missingIds.join(', ')}`);
    }

    const existingAssociations = await this.prisma.employeeDocumentType.findMany({
      where: {
        employeeId,
        documentTypeId: { in: dto.documentTypeIds },
      },
    });

    if (existingAssociations.length > 0) {
      const existingIds = existingAssociations.map(assoc => assoc.documentTypeId);
      throw new ConflictException(`Employee already associated with document types: ${existingIds.join(', ')}`);
    }

    const associations = dto.documentTypeIds.map(documentTypeId => ({
      employeeId,
      documentTypeId,
    }));

    await this.prisma.employeeDocumentType.createMany({
      data: associations,
    });

    return this.getEmployeeDocumentTypes(employeeId);
  }

  async disassociateDocumentTypes(employeeId: number, dto: AssociateDocumentTypesDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const existingAssociations = await this.prisma.employeeDocumentType.findMany({
      where: {
        employeeId,
        documentTypeId: { in: dto.documentTypeIds },
      },
    });

    if (existingAssociations.length === 0) {
      throw new NotFoundException('No associations found to remove');
    }

    const submittedDocuments = await this.prisma.document.findMany({
      where: {
        employeeId,
        documentTypeId: { in: dto.documentTypeIds },
      },
    });

    if (submittedDocuments.length > 0) {
      const submittedIds = submittedDocuments.map(doc => doc.documentTypeId);
      throw new ConflictException(`Cannot disassociate document types with submitted documents: ${submittedIds.join(', ')}`);
    }

    await this.prisma.employeeDocumentType.deleteMany({
      where: {
        employeeId,
        documentTypeId: { in: dto.documentTypeIds },
      },
    });

    return this.getEmployeeDocumentTypes(employeeId);
  }

  async getEmployeeDocumentTypes(employeeId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const associations = await this.prisma.employeeDocumentType.findMany({
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

    return {
      employeeId,
      employeeName: employee.name,
      documentTypes: associations.map(assoc => ({
        id: assoc.documentType.id,
        name: assoc.documentType.name,
        associatedAt: assoc.createdAt,
      })),
    };
  }
}