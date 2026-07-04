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
import { InvoiceItem } from './invoice-item.entity.js';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string; // e.g. 'INV-2026-001'

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @Column('real', { default: 0 })
  taxRate: number;

  @Column('real', { default: 0 })
  subtotal: number;

  @Column('real', { default: 0 })
  taxAmount: number;

  @Column('real', { default: 0 })
  total: number;

  @Column({ default: 'draft' })
  status: string; // draft | sent | paid | overdue

  @Column({ type: 'text' })
  issueDate: string;

  @Column({ type: 'text' })
  dueDate: string;

  @Column({ nullable: true, type: 'text' })
  paidAt: string | null;

  @Column({ nullable: true, type: 'text' })
  sentAt: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Client, (client) => client.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: string;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice, {
    cascade: true,
  })
  invoiceItems: InvoiceItem[];
}
