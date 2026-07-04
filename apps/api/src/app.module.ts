import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TimeEntriesModule } from './time-entries/time-entries.module.js';
import { TimerModule } from './timer/timer.module.js';
import { InvoicesModule } from './invoices/invoices.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { SeedModule } from './seed/seed.module.js';
import { User } from './entities/user.entity.js';
import { Client } from './entities/client.entity.js';
import { Project } from './entities/project.entity.js';
import { TimeEntry } from './entities/time-entry.entity.js';
import { Invoice } from './entities/invoice.entity.js';
import { InvoiceItem } from './entities/invoice-item.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DATABASE_PATH', './data/timetracker.db'),
        entities: [User, Client, Project, TimeEntry, Invoice, InvoiceItem],
        synchronize: true,
      }),
    }),
    AuthModule,
    ClientsModule,
    ProjectsModule,
    TimeEntriesModule,
    TimerModule,
    InvoicesModule,
    DashboardModule,
    ReportsModule,
    SeedModule,
  ],
})
export class AppModule {}
