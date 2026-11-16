import { Module } from '@nestjs/common';
import { DocumentController } from '../controllers/document.controller';
import { DocumentService } from '../services/document.service';
import { StorageService } from '../services/storage.service';
import { DocumentRepository } from '../repositories/document.repository';
import { ApplicationFormModule } from './application-form.module';

@Module({
  imports: [ApplicationFormModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentRepository, StorageService],
  exports: [DocumentService],
})
export class DocumentModule {}
