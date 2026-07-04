import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity.js';
import { Project } from './project.entity.js';
import { TimeEntry } from './time-entry.entity.js';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column('real')
  hours: number;

  @Column('real')
  rate: number;

  @Column('real')
  amount: number;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.invoiceItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column()
  invoiceId: string;

  @ManyToOne(() => Project, (project) => project.invoiceItems, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'projectId' })
  project: Project | null;

  @Column({ nullable: true })
  projectId: string | null;

  @OneToOne(() => TimeEntry, (timeEntry) => timeEntry.invoiceItem, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'timeEntryId' })
  timeEntry: TimeEntry | null;

  @Column({ nullable: true })
  timeEntryId: string | null;
}
