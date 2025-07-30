import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentTypeService {
  constructor(private prisma: PrismaService) {}

  async create(createDocumentTypeDto: CreateDocumentTypeDto): Promise<DocumentType> {
    const { name } = createDocumentTypeDto;

    const existingDocumentType = await this.prisma.documentType.findUnique({
      where: { name },
    });

    if (existingDocumentType) {
      throw new ConflictException('Document type with this name already exists');
    }

    return this.prisma.documentType.create({
      data: { name },
    });
  }

  async findAll(): Promise<DocumentType[]> {
    return this.prisma.documentType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<DocumentType> {
    const documentType = await this.prisma.documentType.findUnique({
      where: { id },
    });

    if (!documentType) {
      throw new NotFoundException('Document type not found');
    }

    return documentType;
  }

  async update(id: number, updateDocumentTypeDto: UpdateDocumentTypeDto): Promise<DocumentType> {
    const documentType = await this.findById(id);

    if (updateDocumentTypeDto.name && updateDocumentTypeDto.name !== documentType.name) {
      const existingDocumentType = await this.prisma.documentType.findUnique({
        where: { name: updateDocumentTypeDto.name },
      });

      if (existingDocumentType) {
        throw new ConflictException('Document type with this name already exists');
      }
    }

    return this.prisma.documentType.update({
      where: { id },
      data: updateDocumentTypeDto,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);

    const hasAssociations = await this.prisma.employeeDocumentType.findFirst({
      where: { documentTypeId: id },
    });

    if (hasAssociations) {
      throw new ConflictException('Cannot delete document type that has employee associations');
    }

    const hasDocuments = await this.prisma.document.findFirst({
      where: { documentTypeId: id },
    });

    if (hasDocuments) {
      throw new ConflictException('Cannot delete document type that has submitted documents');
    }

    await this.prisma.documentType.delete({
      where: { id },
    });
  }
}