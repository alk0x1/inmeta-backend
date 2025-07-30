import { Module } from '@nestjs/common';
import { DocumentController, DocumentManagementController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
  controllers: [DocumentController, DocumentManagementController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}