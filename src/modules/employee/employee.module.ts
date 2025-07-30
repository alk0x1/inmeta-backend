import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeAssociationController } from './employee-association.controller';
import { EmployeeAssociationService } from './employee-association.service';

@Module({
  controllers: [EmployeeController, EmployeeAssociationController],
  providers: [EmployeeService, EmployeeAssociationService],
  exports: [EmployeeService, EmployeeAssociationService],
})
export class EmployeeModule {}