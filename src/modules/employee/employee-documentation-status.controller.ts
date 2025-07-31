import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { EmployeeDocumentationStatusService } from './employee-documentation-status.service';
import { ParseIntPipe } from '../../common/pipes/parse-int.pipe';
import { IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class MultipleEmployeesStatusDto {
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  employeeIds: number[];
}

@Controller('employees/:employeeId/documentation-status')
export class EmployeeDocumentationStatusController {
  constructor(
    private readonly employeeDocumentationStatusService: EmployeeDocumentationStatusService,
  ) {}

  @Get()
  getEmployeeDocumentationStatus(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.employeeDocumentationStatusService.getEmployeeDocumentationStatus(employeeId);
  }
}

@Controller('documentation-status')
export class DocumentationStatusController {
  constructor(
    private readonly employeeDocumentationStatusService: EmployeeDocumentationStatusService,
  ) {}

  @Post('multiple')
  getMultipleEmployeesStatus(@Body() dto: MultipleEmployeesStatusDto) {
    return this.employeeDocumentationStatusService.getMultipleEmployeesDocumentationStatus(dto.employeeIds);
  }

  @Get('incomplete')
  getEmployeesWithIncompleteDocumentation() {
    return this.employeeDocumentationStatusService.getEmployeesWithIncompleteDocumentation();
  }
}