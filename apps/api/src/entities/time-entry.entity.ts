import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity.js';
import { Project } from './project.entity.js';
import { InvoiceItem } from './invoice-item.entity.js';

@Entity('time_entries')
export class TimeEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column('real')
  duration: number; // hours, e.g. 1.5 = 1h30m

  @Column({ type: 'text' })
  date: string; // YYYY-MM-DD

  @Column({ default: true })
  billable: boolean;

  @Column({ default: false })
  invoiced: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.timeEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Project, (project) => project.timeEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @OneToOne(() => InvoiceItem, (invoiceItem) => invoiceItem.timeEntry, {
    nullable: true,
  })
  invoiceItem: InvoiceItem | null;
}
