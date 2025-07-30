import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ParseIntPipe } from '../../common/pipes/parse-int.pipe';

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

  @Get()
  getEmployeeDocuments(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.documentService.getEmployeeDocuments(employeeId);
  }
}

@Controller('documents')
export class DocumentManagementController {
  constructor(private readonly documentService: DocumentService) {}

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.documentService.findById(id);
  }
}