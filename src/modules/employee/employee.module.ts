import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeAssociationController } from './employee-association.controller';
import { EmployeeAssociationService } from './employee-association.service';
import { BulkAssociationController } from './bulk-association.controller';
import { EmployeeDocumentationStatusController, DocumentationStatusController } from './employee-documentation-status.controller';
import { EmployeeDocumentationStatusService } from './employee-documentation-status.service';

@Module({
  controllers: [
    EmployeeController,
    EmployeeAssociationController,
    BulkAssociationController,
    EmployeeDocumentationStatusController,
    DocumentationStatusController,
  ],
  providers: [
    EmployeeService,
    EmployeeAssociationService,
    EmployeeDocumentationStatusService,
  ],
  exports: [
    EmployeeService,
    EmployeeAssociationService,
    EmployeeDocumentationStatusService,
  ],
})
export class EmployeeModule {}