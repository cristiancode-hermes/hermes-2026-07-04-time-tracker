import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { TimeEntry } from '../entities/time-entry.entity.js';
import { Invoice } from '../entities/invoice.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([TimeEntry, Invoice])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
