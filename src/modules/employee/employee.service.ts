import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
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

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (updateEmployeeDto.document && updateEmployeeDto.document !== employee.document) {
      const existingEmployee = await this.prisma.employee.findUnique({
        where: { document: updateEmployeeDto.document },
      });

      if (existingEmployee) {
        throw new ConflictException('Employee with this document already exists');
      }
    }

    const updateData: any = {};
    
    if (updateEmployeeDto.name) updateData.name = updateEmployeeDto.name;
    if (updateEmployeeDto.document) updateData.document = updateEmployeeDto.document;
    if (updateEmployeeDto.hiredAt) updateData.hiredAt = new Date(updateEmployeeDto.hiredAt);

    return this.prisma.employee.update({
      where: { id },
      data: updateData,
    });
  }

  async findById(id: number): Promise<Employee> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }
}