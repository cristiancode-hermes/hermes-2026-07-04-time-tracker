import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity.js';
import { InvoiceItem } from '../entities/invoice-item.entity.js';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent'],
  sent: ['paid', 'overdue'],
  overdue: ['paid'],
  paid: [],
};

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async findAll(
    userId: string,
    query: { status?: string; clientId?: string; page?: number; limit?: number },
  ) {
    const { status, clientId, page = 1, limit = 20 } = query;
    const where: any = { userId };

    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const [data, total] = await this.invoiceRepository.findAndCount({
      where,
      relations: { client: true, invoiceItems: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, userId },
      relations: { client: true, invoiceItems: { project: true } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(userId: string, dto: CreateInvoiceDto) {
    let subtotal = 0;
    const items = dto.items.map((item, index) => {
      const amount = item.hours * item.rate;
      subtotal += amount;
      return this.invoiceItemRepository.create({
        description: item.description,
        hours: item.hours,
        rate: item.rate,
        amount,
        sortOrder: item.sortOrder ?? index,
        project: item.projectId ? ({ id: item.projectId } as any) : null,
        projectId: item.projectId ?? null,
        timeEntry: item.timeEntryId
          ? ({ id: item.timeEntryId } as any)
          : null,
        timeEntryId: item.timeEntryId ?? null,
      });
    });

    const taxAmount = subtotal * (dto.taxRate ?? 0);
    const total = subtotal + taxAmount;

    const invoice = this.invoiceRepository.create({
      invoiceNumber: dto.invoiceNumber,
      notes: dto.notes ?? null,
      taxRate: dto.taxRate ?? 0,
      subtotal,
      taxAmount,
      total,
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
      user: { id: userId } as any,
      userId,
      client: { id: dto.clientId } as any,
      clientId: dto.clientId,
      invoiceItems: items,
    });

    return this.invoiceRepository.save(invoice);
  }

  async updateStatus(id: string, userId: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.findOne(id, userId);
    const currentStatus = invoice.status;
    const newStatus = dto.status;

    if (currentStatus === 'paid') {
      throw new BadRequestException('Cannot change status of a paid invoice');
    }

    const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }

    invoice.status = newStatus;

    if (newStatus === 'sent') {
      invoice.sentAt = new Date().toISOString();
    } else if (newStatus === 'paid') {
      invoice.paidAt = new Date().toISOString();
    }

    return this.invoiceRepository.save(invoice);
  }

  async remove(id: string, userId: string) {
    const invoice = await this.findOne(id, userId);
    return this.invoiceRepository.remove(invoice);
  }
}
