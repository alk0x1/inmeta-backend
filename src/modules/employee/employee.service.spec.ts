import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    employee: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createEmployeeDto: CreateEmployeeDto = {
      name: 'João Silva',
      document: '12345678901',
      hiredAt: '2024-01-01',
    };

    const mockEmployee = {
      id: 1,
      name: 'João Silva',
      document: '12345678901',
      hiredAt: new Date('2024-01-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create an employee successfully', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(null);
      mockPrismaService.employee.create.mockResolvedValue(mockEmployee);

      const result = await service.create(createEmployeeDto);

      expect(mockPrismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { document: '12345678901' },
      });
      expect(mockPrismaService.employee.create).toHaveBeenCalledWith({
        data: {
          name: 'João Silva',
          document: '12345678901',
          hiredAt: new Date('2024-01-01'),
        },
      });
      expect(result).toEqual(mockEmployee);
    });

    it('should throw ConflictException if employee with document already exists', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);

      await expect(service.create(createEmployeeDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.employee.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateEmployeeDto: UpdateEmployeeDto = {
      name: 'João Silva Santos',
    };

    const mockEmployee = {
      id: 1,
      name: 'João Silva',
      document: '12345678901',
      hiredAt: new Date('2024-01-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedEmployee = {
      ...mockEmployee,
      name: 'João Silva Santos',
    };

    it('should update an employee successfully', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrismaService.employee.update.mockResolvedValue(updatedEmployee);

      const result = await service.update(1, updateEmployeeDto);

      expect(mockPrismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.employee.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'João Silva Santos' },
      });
      expect(result).toEqual(updatedEmployee);
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(null);

      await expect(service.update(1, updateEmployeeDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.employee.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if updating document to existing one', async () => {
      const updateWithDocument = { document: '98765432100' };
      const existingEmployee = { ...mockEmployee, document: '98765432100' };

      mockPrismaService.employee.findUnique
        .mockResolvedValueOnce(mockEmployee) // First call - finding employee to update
        .mockResolvedValueOnce(existingEmployee); // Second call - checking for duplicate document

      await expect(service.update(1, updateWithDocument)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.employee.update).not.toHaveBeenCalled();
    });

    it('should update document if new document is different and not duplicate', async () => {
      const updateWithDocument = { document: '98765432100' };
      
      mockPrismaService.employee.findUnique
        .mockResolvedValueOnce(mockEmployee) // First call - finding employee to update
        .mockResolvedValueOnce(null); // Second call - no duplicate found
      
      const updatedWithDocument = { ...mockEmployee, document: '98765432100' };
      mockPrismaService.employee.update.mockResolvedValue(updatedWithDocument);

      const result = await service.update(1, updateWithDocument);

      expect(mockPrismaService.employee.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { document: '98765432100' },
      });
      expect(result).toEqual(updatedWithDocument);
    });
  });

  describe('findById', () => {
    const mockEmployee = {
      id: 1,
      name: 'João Silva',
      document: '12345678901',
      hiredAt: new Date('2024-01-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return an employee if found', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);

      const result = await service.findById(1);

      expect(mockPrismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('edge cases and validation', () => {
    it('should handle empty update data', async () => {
      const mockEmployee = {
        id: 1,
        name: 'João Silva',
        document: '12345678901',
        hiredAt: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrismaService.employee.update.mockResolvedValue(mockEmployee);

      const result = await service.update(1, {});

      expect(mockPrismaService.employee.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {},
      });
      expect(result).toEqual(mockEmployee);
    });

    it('should not check for duplicate document if document is not being updated', async () => {
      const mockEmployee = {
        id: 1,
        name: 'João Silva',
        document: '12345678901',
        hiredAt: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto = { name: 'New Name' };

      mockPrismaService.employee.findUnique.mockResolvedValueOnce(mockEmployee);
      mockPrismaService.employee.update.mockResolvedValue({
        ...mockEmployee,
        name: 'New Name',
      });

      await service.update(1, updateDto);

      expect(mockPrismaService.employee.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should not check for duplicate if new document is same as current', async () => {
      const mockEmployee = {
        id: 1,
        name: 'João Silva',
        document: '12345678901',
        hiredAt: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto = { document: '12345678901' }; // Same document

      mockPrismaService.employee.findUnique.mockResolvedValueOnce(mockEmployee);
      mockPrismaService.employee.update.mockResolvedValue(mockEmployee);

      await service.update(1, updateDto);

      expect(mockPrismaService.employee.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.employee.update).toHaveBeenCalled();
    });
  });
});