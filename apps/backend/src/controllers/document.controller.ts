import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from './base.controller';
import { DocumentEntity } from '../entities/document.entity';
import { DocumentService } from '../services/document.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentController extends BaseController<DocumentEntity> {
  constructor(private readonly documentService: DocumentService) {
    super(documentService);
  }

  @Get('application/:applicationId')
  async getByApplicationId(
    @Param('applicationId', new ParseUUIDPipe()) applicationId: string,
  ) {
    return this.documentService.findByApplicationId(applicationId);
  }

  @Get(':id/download')
  async download(@Param('id', new ParseUUIDPipe()) id: string) {
    const { document, stream } = await this.documentService.download(id);
    return new StreamableFile(stream, {
      type: document.mimeType,
      length: document.sizeBytes,
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(document.originalFilename)}`,
    });
  }
}
