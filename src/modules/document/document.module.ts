import { Module } from '@nestjs/common';
import { DocumentController, DocumentManagementController } from './document.controller';
import { DocumentService } from './document.service';
import { PendingDocumentsController } from './pending-documents.controller';
import { PendingDocumentsService } from './pending-documents.service';

@Module({
  controllers: [
    DocumentController,
    DocumentManagementController,
    PendingDocumentsController,
  ],
  providers: [
    DocumentService,
    PendingDocumentsService,
  ],
  exports: [
    DocumentService,
    PendingDocumentsService,
  ],
})
export class DocumentModule {}