import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import type { Response } from 'express';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get period report summary' })
  @ApiQuery({ name: 'from', example: '2026-06-01', required: true })
  @ApiQuery({ name: 'to', example: '2026-07-04', required: true })
  getSummary(
    @Req() req: any,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getSummary(req.user.id, { from, to });
  }

  @Get('export')
  @ApiOperation({ summary: 'Export time entries as CSV' })
  @ApiQuery({ name: 'from', example: '2026-06-01', required: true })
  @ApiQuery({ name: 'to', example: '2026-07-04', required: true })
  async exportCsv(
    @Req() req: any,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const csv = await this.reportsService.exportCsv(req.user.id, { from, to });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="time-entries-${from}-to-${to}.csv"`,
    );
    res.send(csv);
  }
}
