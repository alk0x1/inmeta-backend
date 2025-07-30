import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeAssociationController } from './employee-association.controller';
import { EmployeeAssociationService } from './employee-association.service';
import { BulkAssociationController } from './bulk-association.controller';

@Module({
  controllers: [EmployeeController, EmployeeAssociationController, BulkAssociationController],
  providers: [EmployeeService, EmployeeAssociationService],
  exports: [EmployeeService, EmployeeAssociationService],
})
export class EmployeeModule {}