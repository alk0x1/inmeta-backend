import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssociateDocumentTypesDto } from './dto/associate-document-types.dto';
import { BulkAssociationDto } from './dto/bulk-association.dto';

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

  async bulkAssociateDocumentTypes(dto: BulkAssociationDto) {
    const results = [];
    const errors = [];

    for (const association of dto.associations) {
      try {
        const employee = await this.prisma.employee.findUnique({
          where: { id: association.employeeId },
        });

        if (!employee) {
          errors.push({
            employeeId: association.employeeId,
            error: 'Employee not found',
          });
          continue;
        }

        const documentTypes = await this.prisma.documentType.findMany({
          where: { id: { in: association.documentTypeIds } },
        });

        if (documentTypes.length !== association.documentTypeIds.length) {
          const foundIds = documentTypes.map(dt => dt.id);
          const missingIds = association.documentTypeIds.filter(id => !foundIds.includes(id));
          errors.push({
            employeeId: association.employeeId,
            error: `Document types not found: ${missingIds.join(', ')}`,
          });
          continue;
        }

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
          });
          continue;
        }

        const newAssociations = newDocumentTypeIds.map(documentTypeId => ({
          employeeId: association.employeeId,
          documentTypeId,
        }));

        await this.prisma.employeeDocumentType.createMany({
          data: newAssociations,
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
    const results = [];
    const errors = [];

    for (const association of dto.associations) {
      try {
        const employee = await this.prisma.employee.findUnique({
          where: { id: association.employeeId },
        });

        if (!employee) {
          errors.push({
            employeeId: association.employeeId,
            error: 'Employee not found',
          });
          continue;
        }

        const existingAssociations = await this.prisma.employeeDocumentType.findMany({
          where: {
            employeeId: association.employeeId,
            documentTypeId: { in: association.documentTypeIds },
          },
        });

        if (existingAssociations.length === 0) {
          errors.push({
            employeeId: association.employeeId,
            error: 'No associations found to remove',
          });
          continue;
        }

        const submittedDocuments = await this.prisma.document.findMany({
          where: {
            employeeId: association.employeeId,
            documentTypeId: { in: association.documentTypeIds },
          },
        });

        if (submittedDocuments.length > 0) {
          const submittedIds = submittedDocuments.map(doc => doc.documentTypeId);
          errors.push({
            employeeId: association.employeeId,
            error: `Cannot disassociate document types with submitted documents: ${submittedIds.join(', ')}`,
          });
          continue;
        }

        await this.prisma.employeeDocumentType.deleteMany({
          where: {
            employeeId: association.employeeId,
            documentTypeId: { in: association.documentTypeIds },
          },
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
}