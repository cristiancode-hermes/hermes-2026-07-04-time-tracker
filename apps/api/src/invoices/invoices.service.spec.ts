import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InvoicesService } from './invoices.service';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let invoiceRepository: Repository<Invoice>;
  let invoiceItemRepository: Repository<InvoiceItem>;

  const mockInvoiceRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
  };

  const mockInvoiceItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepository,
        },
        {
          provide: getRepositoryToken(InvoiceItem),
          useValue: mockInvoiceItemRepository,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    invoiceRepository = module.get<Repository<Invoice>>(
      getRepositoryToken(Invoice),
    );
    invoiceItemRepository = module.get<Repository<InvoiceItem>>(
      getRepositoryToken(InvoiceItem),
    );
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an invoice with items and calculate totals', async () => {
      const dto = {
        invoiceNumber: 'INV-2026-003',
        notes: 'Test invoice',
        taxRate: 0.1,
        issueDate: '2026-07-01',
        dueDate: '2026-07-31',
        clientId: 'client-1',
        items: [
          { description: 'Work A', hours: 10, rate: 100, sortOrder: 0 },
          { description: 'Work B', hours: 5, rate: 50, sortOrder: 1 },
        ],
      };

      mockInvoiceItemRepository.create
        .mockReturnValueOnce({
          description: 'Work A',
          hours: 10,
          rate: 100,
          amount: 1000,
        })
        .mockReturnValueOnce({
          description: 'Work B',
          hours: 5,
          rate: 50,
          amount: 250,
        });

      mockInvoiceRepository.create.mockReturnValue({
        id: 'inv-1',
        invoiceNumber: 'INV-2026-003',
        subtotal: 1250,
        taxAmount: 125,
        total: 1375,
        invoiceItems: [],
      });
      mockInvoiceRepository.save.mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-2026-003',
        subtotal: 1250,
        taxAmount: 125,
        total: 1375,
      });

      const result = await service.create('user-1', dto);

      expect(result).toHaveProperty('id');
      expect(mockInvoiceRepository.create).toHaveBeenCalled();
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should transition from draft to sent and set sentAt', async () => {
      const invoice = {
        id: 'inv-1',
        status: 'draft',
        sentAt: null,
        paidAt: null,
      };
      mockInvoiceRepository.findOne.mockResolvedValue(invoice);
      mockInvoiceRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );

      const result = await service.updateStatus('inv-1', 'user-1', {
        status: 'sent',
      });

      expect(result.status).toBe('sent');
      expect(result.sentAt).toBeTruthy();
    });

    it('should transition from sent to paid and set paidAt', async () => {
      const invoice = {
        id: 'inv-1',
        status: 'sent',
        sentAt: '2026-06-15T10:00:00Z',
        paidAt: null,
      };
      mockInvoiceRepository.findOne.mockResolvedValue(invoice);
      mockInvoiceRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );

      const result = await service.updateStatus('inv-1', 'user-1', {
        status: 'paid',
      });

      expect(result.status).toBe('paid');
      expect(result.paidAt).toBeTruthy();
    });

    it('should transition from sent to overdue', async () => {
      const invoice = {
        id: 'inv-1',
        status: 'sent',
        sentAt: '2026-06-15T10:00:00Z',
      };
      mockInvoiceRepository.findOne.mockResolvedValue(invoice);
      mockInvoiceRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );

      const result = await service.updateStatus('inv-1', 'user-1', {
        status: 'overdue',
      });
      expect(result.status).toBe('overdue');
    });

    it('should not allow paid -> anything', async () => {
      const invoice = {
        id: 'inv-1',
        status: 'paid',
        sentAt: '2026-06-15T10:00:00Z',
        paidAt: '2026-07-01T10:00:00Z',
      };
      mockInvoiceRepository.findOne.mockResolvedValue(invoice);

      await expect(
        service.updateStatus('inv-1', 'user-1', { status: 'draft' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid transition', async () => {
      const invoice = {
        id: 'inv-1',
        status: 'draft',
        sentAt: null,
        paidAt: null,
      };
      mockInvoiceRepository.findOne.mockResolvedValue(invoice);

      await expect(
        service.updateStatus('inv-1', 'user-1', { status: 'paid' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return an invoice with relations', async () => {
      const invoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-2026-001',
        client: { name: 'Client A' },
        invoiceItems: [],
      };
      mockInvoiceRepository.findOne.mockResolvedValue(invoice);

      const result = await service.findOne('inv-1', 'user-1');
      expect(result.id).toBe('inv-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
