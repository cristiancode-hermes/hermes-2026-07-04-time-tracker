import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity.js';
import { Client } from './client.entity.js';
import { TimeEntry } from './time-entry.entity.js';
import { InvoiceItem } from './invoice-item.entity.js';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column('real')
  hourlyRate: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 'active' })
  status: string; // active | completed | paused

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Client, (client) => client.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: string;

  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.project)
  timeEntries: TimeEntry[];

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.project)
  invoiceItems: InvoiceItem[];
}
