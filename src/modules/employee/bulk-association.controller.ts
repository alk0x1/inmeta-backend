import { Controller, Post, Delete, Body } from '@nestjs/common';
import { EmployeeAssociationService } from './employee-association.service';
import { BulkAssociationDto } from './dto/bulk-association.dto';

@Controller('bulk-associations')
export class BulkAssociationController {
  constructor(private readonly employeeAssociationService: EmployeeAssociationService) {}

  @Post('associate')
  bulkAssociate(@Body() bulkAssociationDto: BulkAssociationDto) {
    return this.employeeAssociationService.bulkAssociateDocumentTypes(bulkAssociationDto);
  }

  @Delete('disassociate')
  bulkDisassociate(@Body() bulkAssociationDto: BulkAssociationDto) {
    return this.employeeAssociationService.bulkDisassociateDocumentTypes(bulkAssociationDto);
  }
}