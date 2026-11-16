import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseController } from './base.controller';
import { DocumentEntity } from '../entities/document.entity';
import {
  DocumentService,
  MAX_DOCUMENT_SIZE_BYTES,
} from '../services/document.service';
import { UploadDocumentDto } from '../dtos/document.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Role, Roles } from '../decorators/roles.decorator';

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

  @Post('application/:applicationId')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES } }),
  )
  async upload(
    @Param('applicationId', new ParseUUIDPipe()) applicationId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documentService.upload(applicationId, file, dto.documentType);
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.documentService.getById(id);
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.documentService.deleteDocument(id);
  }
}
