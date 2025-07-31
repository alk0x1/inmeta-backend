import { Controller, Get, Query, Param } from '@nestjs/common';
import { PendingDocumentsService } from './pending-documents.service';
import { PendingDocumentsFilterDto } from '../employee/dto/pending-documents.dto';
import { ParseIntPipe } from '../../common/pipes/parse-int.pipe';

@Controller('pending-documents')
export class PendingDocumentsController {
  constructor(private readonly pendingDocumentsService: PendingDocumentsService) {}

  @Get()
  getPendingDocuments(@Query() filterDto: PendingDocumentsFilterDto) {
    return this.pendingDocumentsService.getPendingDocuments(filterDto);
  }

  @Get('employee/:employeeId')
  getPendingDocumentsByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.pendingDocumentsService.getPendingDocumentsByEmployee(employeeId);
  }

  @Get('document-type/:documentTypeId')
  getPendingDocumentsByDocumentType(@Param('documentTypeId', ParseIntPipe) documentTypeId: number) {
    return this.pendingDocumentsService.getPendingDocumentsByDocumentType(documentTypeId);
  }

  @Get('report')
  getPendingDocumentsReport() {
    return this.pendingDocumentsService.getPendingDocumentsReport();
  }
}