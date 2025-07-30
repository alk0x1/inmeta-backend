import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssociateDocumentTypesDto } from './dto/associate-document-types.dto';
import { BulkAssociationDto } from './dto/bulk-association.dto';

@Injectable()
export class EmployeeAssociationService {
  constructor(private prisma: PrismaService) {}

  async associateDocumentTypes(employeeId: number, dto: AssociateDocumentTypesDto) {
    await this.validateEmployee(employeeId);
    await this.validateDocumentTypes(dto.documentTypeIds);
    await this.checkExistingAssociations(employeeId, dto.documentTypeIds);

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
    await this.validateEmployee(employeeId);
    await this.validateExistingAssociationsForRemoval(employeeId, dto.documentTypeIds);
    await this.checkSubmittedDocuments(employeeId, dto.documentTypeIds);

    await this.prisma.employeeDocumentType.deleteMany({
      where: {
        employeeId,
        documentTypeId: { in: dto.documentTypeIds },
      },
    });

    return this.getEmployeeDocumentTypes(employeeId);
  }

  async bulkAssociateDocumentTypes(dto: BulkAssociationDto) {
    this.validateBulkRequestUniqueness(dto);
    
    const results = [];
    const errors = [];

    for (const association of dto.associations) {
      try {
        await this.validateEmployee(association.employeeId);
        await this.validateDocumentTypes(association.documentTypeIds);

        const existingAssociations = await this.prisma.employeeDocumentType.findMany({
          where: {
            employeeId: association.employeeId,
            documentTypeId: { in: association.documentTypeIds },
          },
        });

        const newDocumentTypeIds = association.documentTypeIds.filter(
          id => !existingAssociations.some(assoc => assoc.documentTypeId === id)
        );

        if (newDocumentTypeIds.length === 0) {
          errors.push({
            employeeId: association.employeeId,
            error: 'All document types already associated',
            details: {
              requestedDocumentTypes: association.documentTypeIds,
              alreadyAssociated: association.documentTypeIds,
            },
          });
          continue;
        }

        if (newDocumentTypeIds.length < association.documentTypeIds.length) {
          const alreadyAssociated = association.documentTypeIds.filter(
            id => !newDocumentTypeIds.includes(id)
          );
          
          errors.push({
            employeeId: association.employeeId,
            error: `Some document types already associated: ${alreadyAssociated.join(', ')}`,
            details: {
              requestedDocumentTypes: association.documentTypeIds,
              alreadyAssociated,
              willBeAssociated: newDocumentTypeIds,
            },
          });
        }

        const newAssociations = newDocumentTypeIds.map(documentTypeId => ({
          employeeId: association.employeeId,
          documentTypeId,
        }));

        await this.prisma.employeeDocumentType.createMany({
          data: newAssociations,
        });

        const employee = await this.prisma.employee.findUnique({
          where: { id: association.employeeId },
        });

        results.push({
          employeeId: association.employeeId,
          employeeName: employee.name,
          associatedDocumentTypes: newDocumentTypeIds,
          status: 'success',
        });
      } catch (error) {
        errors.push({
          employeeId: association.employeeId,
          error: error.message,
        });
      }
    }

    return {
      successful: results,
      errors,
      summary: {
        total: dto.associations.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }

  async bulkDisassociateDocumentTypes(dto: BulkAssociationDto) {
    this.validateBulkRequestUniqueness(dto);
    
    const results = [];
    const errors = [];

    for (const association of dto.associations) {
      try {
        await this.validateEmployee(association.employeeId);
        await this.validateExistingAssociationsForRemoval(association.employeeId, association.documentTypeIds);
        await this.checkSubmittedDocuments(association.employeeId, association.documentTypeIds);

        await this.prisma.employeeDocumentType.deleteMany({
          where: {
            employeeId: association.employeeId,
            documentTypeId: { in: association.documentTypeIds },
          },
        });

        const employee = await this.prisma.employee.findUnique({
          where: { id: association.employeeId },
        });

        results.push({
          employeeId: association.employeeId,
          employeeName: employee.name,
          disassociatedDocumentTypes: association.documentTypeIds,
          status: 'success',
        });
      } catch (error) {
        errors.push({
          employeeId: association.employeeId,
          error: error.message,
        });
      }
    }

    return {
      successful: results,
      errors,
      summary: {
        total: dto.associations.length,
        successful: results.length,
        failed: errors.length,
      },
    };
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

  private async validateEmployee(employeeId: number): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }
  }

  private async validateDocumentTypes(documentTypeIds: number[]): Promise<void> {
    const documentTypes = await this.prisma.documentType.findMany({
      where: { id: { in: documentTypeIds } },
    });

    if (documentTypes.length !== documentTypeIds.length) {
      const foundIds = documentTypes.map(dt => dt.id);
      const missingIds = documentTypeIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Document types not found: ${missingIds.join(', ')}`);
    }
  }

  private async checkExistingAssociations(employeeId: number, documentTypeIds: number[]): Promise<void> {
    const existingAssociations = await this.prisma.employeeDocumentType.findMany({
      where: {
        employeeId,
        documentTypeId: { in: documentTypeIds },
      },
    });

    if (existingAssociations.length > 0) {
      const existingIds = existingAssociations.map(assoc => assoc.documentTypeId);
      throw new ConflictException(`Employee already associated with document types: ${existingIds.join(', ')}`);
    }
  }

  private async validateExistingAssociationsForRemoval(employeeId: number, documentTypeIds: number[]): Promise<void> {
    const existingAssociations = await this.prisma.employeeDocumentType.findMany({
      where: {
        employeeId,
        documentTypeId: { in: documentTypeIds },
      },
    });

    if (existingAssociations.length === 0) {
      throw new NotFoundException('No associations found to remove');
    }

    if (existingAssociations.length !== documentTypeIds.length) {
      const foundIds = existingAssociations.map(assoc => assoc.documentTypeId);
      const missingIds = documentTypeIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`No associations found for document types: ${missingIds.join(', ')}`);
    }
  }

  private async checkSubmittedDocuments(employeeId: number, documentTypeIds: number[]): Promise<void> {
    const submittedDocuments = await this.prisma.document.findMany({
      where: {
        employeeId,
        documentTypeId: { in: documentTypeIds },
      },
    });

    if (submittedDocuments.length > 0) {
      const submittedIds = submittedDocuments.map(doc => doc.documentTypeId);
      throw new ConflictException(`Cannot disassociate document types with submitted documents: ${submittedIds.join(', ')}`);
    }
  }

  private validateBulkRequestUniqueness(dto: BulkAssociationDto): void {
    const seenPairs = new Set<string>();
    
    for (const association of dto.associations) {
      for (const documentTypeId of association.documentTypeIds) {
        const key = `${association.employeeId}-${documentTypeId}`;
        if (seenPairs.has(key)) {
          throw new BadRequestException(`Duplicate association found: Employee ${association.employeeId} with Document Type ${documentTypeId}`);
        }
        seenPairs.add(key);
      }
    }
  }
}