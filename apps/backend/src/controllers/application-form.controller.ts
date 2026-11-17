import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { BaseController } from './base.controller';
import { ApplicationFormEntity } from '../entities/application-form.entity';
import { ApplicationFormService } from '../services/application-form.service';
import { QueryApplicationFormDto, UpdateApplicationStatusDto } from '../dtos/application-form.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('application-forms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationFormController extends BaseController<ApplicationFormEntity> {
  constructor(private readonly applicationFormService: ApplicationFormService) {
    super(applicationFormService);
  }

  @Get()
  async getAll(@Query() query?: QueryApplicationFormDto) {
    return this.applicationFormService.findWithFilters(query);
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.applicationFormService.getById(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.applicationFormService.updateStatus(
      id,
      dto.status,
      req.user.id,
      dto.remarks,
    );
  }
}
