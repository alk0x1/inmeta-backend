import { IsEnum } from 'class-validator';
import { DocumentStatus } from '@prisma/client';

export class UpdateDocumentStatusDto {
  @IsEnum(DocumentStatus, { message: 'Status must be either PENDING or SENT' })
  status: DocumentStatus;
}