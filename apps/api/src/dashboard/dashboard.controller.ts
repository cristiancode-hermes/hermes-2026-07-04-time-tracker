import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard KPIs (today, week, month hours + pending/overdue)' })
  getDashboard(@Req() req: any) {
    return this.dashboardService.getDashboard(req.user.id);
  }

  @Get('weekly-chart')
  @ApiOperation({ summary: 'Get weekly hours chart data (last 7 days)' })
  getWeeklyChart(@Req() req: any) {
    return this.dashboardService.getWeeklyChart(req.user.id);
  }

  @Get('pending-invoices')
  @ApiOperation({ summary: 'Get pending and overdue invoices' })
  getPendingInvoices(@Req() req: any) {
    return this.dashboardService.getPendingInvoices(req.user.id);
  }
}
