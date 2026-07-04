import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed/seed.module.js';
import { SeedService } from './seed/seed.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { User } from './entities/user.entity.js';
import { Client } from './entities/client.entity.js';
import { Project } from './entities/project.entity.js';
import { TimeEntry } from './entities/time-entry.entity.js';
import { Invoice } from './entities/invoice.entity.js';
import { InvoiceItem } from './entities/invoice-item.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH || './data/timetracker.db',
      entities: [User, Client, Project, TimeEntry, Invoice, InvoiceItem],
      synchronize: true,
    }),
    SeedModule,
  ],
})
class SeedAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedAppModule);
  const seedService = app.get(SeedService);
  await seedService.seed();
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
