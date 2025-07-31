import { Controller, Post, Get, Put, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import { DocumentFilterDto } from './dto/document-filter.dto';
import { ParseIntPipe } from '../../common/pipes/parse-int.pipe';
import { DocumentStatus } from '@prisma/client';

@Controller('employees/:employeeId/documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  submitDocument(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentService.submitDocument(employeeId, createDocumentDto);
  }

  @Put('resubmit/:documentTypeId')
  resubmitDocument(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('documentTypeId', ParseIntPipe) documentTypeId: number,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentService.resubmitDocument(employeeId, documentTypeId, createDocumentDto);
  }

  @Get()
  getEmployeeDocuments(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.documentService.getEmployeeDocuments(employeeId);
  }

  @Get('check-duplicate/:documentTypeId')
  checkDuplicateSubmission(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('documentTypeId', ParseIntPipe) documentTypeId: number,
  ) {
    return this.documentService.checkDuplicateSubmission(employeeId, documentTypeId);
  }
}

@Controller('documents')
export class DocumentManagementController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  getAllDocuments(@Query() filterDto: DocumentFilterDto) {
    return this.documentService.getAllDocuments(filterDto);
  }

  @Get('status/:status')
  getDocumentsByStatus(@Param('status') status: DocumentStatus) {
    return this.documentService.getDocumentsByStatus(status);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.documentService.findById(id);
  }

  @Put(':id/status')
  updateDocumentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateDocumentStatusDto,
  ) {
    return this.documentService.updateDocumentStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDocument(@Param('id', ParseIntPipe) id: number) {
    return this.documentService.removeDocument(id);
  }
}