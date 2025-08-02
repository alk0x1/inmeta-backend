import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let service: EmployeeService;

  const mockEmployeeService = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
  };

  const mockEmployee = {
    id: 1,
    name: 'João Silva',
    document: '12345678901',
    hiredAt: new Date('2024-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
    service = module.get<EmployeeService>(EmployeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an employee', async () => {
      const createEmployeeDto: CreateEmployeeDto = {
        name: 'João Silva',
        document: '12345678901',
        hiredAt: '2024-01-01',
      };

      mockEmployeeService.create.mockResolvedValue(mockEmployee);

      const result = await controller.create(createEmployeeDto);

      expect(service.create).toHaveBeenCalledWith(createEmployeeDto);
      expect(result).toEqual(mockEmployee);
    });
  });

  describe('update', () => {
    it('should update an employee', async () => {
      const updateEmployeeDto: UpdateEmployeeDto = {
        name: 'João Silva Santos',
      };

      const updatedEmployee = {
        ...mockEmployee,
        name: 'João Silva Santos',
      };

      mockEmployeeService.update.mockResolvedValue(updatedEmployee);

      const result = await controller.update(1, updateEmployeeDto);

      expect(service.update).toHaveBeenCalledWith(1, updateEmployeeDto);
      expect(result).toEqual(updatedEmployee);
    });
  });

  describe('findById', () => {
    it('should return an employee by id', async () => {
      mockEmployeeService.findById.mockResolvedValue(mockEmployee);

      const result = await controller.findById(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEmployee);
    });
  });
});