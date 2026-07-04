import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Client } from './client.entity.js';
import { Project } from './project.entity.js';
import { TimeEntry } from './time-entry.entity.js';
import { Invoice } from './invoice.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  passwordHash: string;

  @Column('real', { nullable: true })
  defaultHourlyRate: number | null;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Client, (client) => client.user)
  clients: Client[];

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.user)
  timeEntries: TimeEntry[];

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices: Invoice[];
}
