import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from './base.controller';
import { InterviewEntity } from '../entities/interview.entity';
import { InterviewService } from '../services/interview.service';
import { CreateInterviewDto, QueryInterviewDto } from '../dtos/interview.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Role, Roles } from '../decorators/roles.decorator';

@Controller('interviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InterviewController extends BaseController<InterviewEntity> {
  constructor(private readonly interviewService: InterviewService) {
    super(interviewService);
  }

  @Get()
  async getAll(@Query() query?: QueryInterviewDto) {
    return this.interviewService.findWithFilters(query);
  }

  @Get('application/:applicationId')
  async getByApplicationId(
    @Param('applicationId', new ParseUUIDPipe()) applicationId: string,
  ) {
    return this.interviewService.findByApplicationId(applicationId);
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.interviewService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateInterviewDto) {
    return this.interviewService.createInterview(dto);
  }
}
