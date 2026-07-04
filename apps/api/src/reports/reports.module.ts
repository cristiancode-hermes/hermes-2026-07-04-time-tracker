import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { TimeEntry } from '../entities/time-entry.entity.js';
import { Invoice } from '../entities/invoice.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([TimeEntry, Invoice])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
