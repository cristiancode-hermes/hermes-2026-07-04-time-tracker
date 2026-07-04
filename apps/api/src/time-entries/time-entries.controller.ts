import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TimeEntriesService } from './time-entries.service.js';
import {
  CreateTimeEntryDto,
  UpdateTimeEntryDto,
  QueryTimeEntryDto,
} from './dto/time-entry.dto.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';

@ApiTags('Time Entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Get()
  @ApiOperation({ summary: 'List time entries with filters and pagination' })
  findAll(@Req() req: any, @Query() query: QueryTimeEntryDto) {
    return this.timeEntriesService.findAll(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get time entry by ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.timeEntriesService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a time entry' })
  create(@Req() req: any, @Body() dto: CreateTimeEntryDto) {
    return this.timeEntriesService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a time entry' })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    return this.timeEntriesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a time entry' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.timeEntriesService.remove(id, req.user.id);
  }
}
