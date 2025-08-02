import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EmployeeAssociationService } from './employee-association.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssociateDocumentTypesDto } from './dto/associate-document-types.dto';

describe('EmployeeAssociationService', () => {
  let service: EmployeeAssociationService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    employee: {
      findUnique: jest.fn(),
    },
    documentType: {
      findMany: jest.fn(),
    },
    employeeDocumentType: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    document: {
      findMany: jest.fn(),
    },
  };

  const mockEmployee = {
    id: 1,
    name: 'João Silva',
    document: '12345678901',
    hiredAt: new Date('2024-01-01'),
  };

  const mockDocumentTypes = [
    { id: 1, name: 'CPF' },
    { id: 2, name: 'RG' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeAssociationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmployeeAssociationService>(EmployeeAssociationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('associateDocumentTypes', () => {
    const associateDto: AssociateDocumentTypesDto = {
      documentTypeIds: [1, 2],
    };

    it('should associate document types successfully', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrismaService.documentType.findMany.mockResolvedValue(mockDocumentTypes);
      mockPrismaService.employeeDocumentType.findMany.mockResolvedValue([]);
      mockPrismaService.employeeDocumentType.createMany.mockResolvedValue({ count: 2 });

      const mockResult = {
        employeeId: 1,
        employeeName: 'João Silva',
        documentTypes: [
          { id: 1, name: 'CPF', associatedAt: new Date() },
          { id: 2, name: 'RG', associatedAt: new Date() },
        ],
      };

      jest.spyOn(service, 'getEmployeeDocumentTypes').mockResolvedValue(mockResult);

      const result = await service.associateDocumentTypes(1, associateDto);

      expect(mockPrismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.documentType.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
      });
      expect(mockPrismaService.employeeDocumentType.createMany).toHaveBeenCalledWith({
        data: [
          { employeeId: 1, documentTypeId: 1 },
          { employeeId: 1, documentTypeId: 2 },
        ],
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(null);

      await expect(service.associateDocumentTypes(1, associateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if document types not found', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrismaService.documentType.findMany.mockResolvedValue([mockDocumentTypes[0]]);

      await expect(service.associateDocumentTypes(1, associateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if associations already exist', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrismaService.documentType.findMany.mockResolvedValue(mockDocumentTypes);
      mockPrismaService.employeeDocumentType.findMany.mockResolvedValue([
        { employeeId: 1, documentTypeId: 1 },
      ]);

      await expect(service.associateDocumentTypes(1, associateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('disassociateDocumentTypes', () => {
    const disassociateDto: AssociateDocumentTypesDto = {
      documentTypeIds: [1, 2],
    };

    it('should disassociate document types successfully', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrismaService.employeeDocumentType.findMany.mockResolvedValue([
        { employeeId: 1, documentTypeId: 1 },
        { employeeId: 1, documentTypeId: 2 },
      ]);
      mockPrismaService.document.findMany.mockResolvedValue([]);
      mockPrismaService.employeeDocumentType.deleteMany.mockResolvedValue({ count: 2 });

      const mockResult = {
        employeeId: 1,
        employeeName: 'João Silva',
        documentTypes: [],
      };

      jest.spyOn(service, 'getEmployeeDocumentTypes').mockResolvedValue(mockResult);

      const result = await service.disassociateDocumentTypes(1, disassociateDto);

      expect(mockPrismaService.employeeDocumentType.deleteMany).toHaveBeenCalledWith({
        where: {
          employeeId: 1,
          documentTypeId: { in: [1, 2] },
        },
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw NotFoundException if no associations found', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrismaService.employeeDocumentType.findMany.mockResolvedValue([]);

      await expect(service.disassociateDocumentTypes(1, disassociateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if some associations not found', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrismaService.employeeDocumentType.findMany.mockResolvedValue([
        { employeeId: 1, documentTypeId: 1 },
      ]);

      await expect(service.disassociateDocumentTypes(1, disassociateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.document.findMany).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if documents already submitted', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrismaService.employeeDocumentType.findMany.mockResolvedValue([
        { employeeId: 1, documentTypeId: 1 },
        { employeeId: 1, documentTypeId: 2 },
      ]);
      mockPrismaService.document.findMany.mockResolvedValue([
        { employeeId: 1, documentTypeId: 1 },
      ]);

      await expect(service.disassociateDocumentTypes(1, disassociateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getEmployeeDocumentTypes', () => {
    it('should return employee document types', async () => {
      const mockAssociations = [
        {
          employeeId: 1,
          documentTypeId: 1,
          createdAt: new Date(),
          documentType: { id: 1, name: 'CPF' },
        },
        {
          employeeId: 1,
          documentTypeId: 2,
          createdAt: new Date(),
          documentType: { id: 2, name: 'RG' },
        },
      ];

      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrismaService.employeeDocumentType.findMany.mockResolvedValue(mockAssociations);

      const result = await service.getEmployeeDocumentTypes(1);

      expect(result).toEqual({
        employeeId: 1,
        employeeName: 'João Silva',
        documentTypes: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: 'CPF',
          }),
          expect.objectContaining({
            id: 2,
            name: 'RG',
          }),
        ]),
      });
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(null);

      await expect(service.getEmployeeDocumentTypes(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});