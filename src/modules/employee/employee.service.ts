import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from '@prisma/client';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const { name, document, hiredAt } = createEmployeeDto;

    const existingEmployee = await this.prisma.employee.findUnique({
      where: { document },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee with this document already exists');
    }

    return this.prisma.employee.create({
      data: {
        name,
        document,
        hiredAt: new Date(hiredAt),
      },
    });
  }
}