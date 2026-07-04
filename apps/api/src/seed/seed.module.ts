import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service.js';
import { User } from '../entities/user.entity.js';
import { Client } from '../entities/client.entity.js';
import { Project } from '../entities/project.entity.js';
import { TimeEntry } from '../entities/time-entry.entity.js';
import { Invoice } from '../entities/invoice.entity.js';
import { InvoiceItem } from '../entities/invoice-item.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Client,
      Project,
      TimeEntry,
      Invoice,
      InvoiceItem,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
