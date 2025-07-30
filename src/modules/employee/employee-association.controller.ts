import { Controller, Post, Delete, Get, Param, Body } from '@nestjs/common';
import { EmployeeAssociationService } from './employee-association.service';
import { AssociateDocumentTypesDto } from './dto/associate-document-types.dto';
import { ParseIntPipe } from '../../common/pipes/parse-int.pipe';

@Controller('employees/:employeeId/document-types')
export class EmployeeAssociationController {
  constructor(private readonly employeeAssociationService: EmployeeAssociationService) {}

  @Post()
  associateDocumentTypes(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() associateDocumentTypesDto: AssociateDocumentTypesDto,
  ) {
    return this.employeeAssociationService.associateDocumentTypes(employeeId, associateDocumentTypesDto);
  }

  @Delete()
  disassociateDocumentTypes(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() associateDocumentTypesDto: AssociateDocumentTypesDto,
  ) {
    return this.employeeAssociationService.disassociateDocumentTypes(employeeId, associateDocumentTypesDto);
  }

  @Get()
  getEmployeeDocumentTypes(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.employeeAssociationService.getEmployeeDocumentTypes(employeeId);
  }
}