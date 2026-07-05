import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { TimeEntry } from '../entities/time-entry.entity';
import { Invoice } from '../entities/invoice.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let timeEntryRepository: Repository<TimeEntry>;
  let invoiceRepository: Repository<Invoice>;

  const mockTimeEntryRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockInvoiceRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(TimeEntry),
          useValue: mockTimeEntryRepository,
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    timeEntryRepository = module.get<Repository<TimeEntry>>(getRepositoryToken(TimeEntry));
    invoiceRepository = module.get<Repository<Invoice>>(getRepositoryToken(Invoice));
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // Mock createQueryBuilder for getHoursInRange
    const mockQb = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total: '3600' }), // 1 hour in seconds
    };
    mockTimeEntryRepository.createQueryBuilder.mockReturnValue(mockQb);
  });

  describe('getDashboard', () => {
    it('should return dashboard KPIs', async () => {
      mockInvoiceRepository.count.mockResolvedValue(3);

      const result = await service.getDashboard('user-1');

      expect(result).toHaveProperty('todayHours');
      expect(result).toHaveProperty('weekHours');
      expect(result).toHaveProperty('monthHours');
      expect(result).toHaveProperty('pendingInvoices');
      expect(result).toHaveProperty('overdueInvoices');
      expect(result.pendingInvoices).toBe(3);
    });

    it('should return zero values when no data exists', async () => {
      const mockQb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '0' }),
      };
      mockTimeEntryRepository.createQueryBuilder.mockReturnValue(mockQb);
      mockInvoiceRepository.count.mockResolvedValue(0);

      const result = await service.getDashboard('user-1');

      expect(result.todayHours).toBe(0);
      expect(result.pendingInvoices).toBe(0);
      expect(result.overdueInvoices).toBe(0);
    });

    it('should handle null raw result gracefully', async () => {
      const mockQb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };
      mockTimeEntryRepository.createQueryBuilder.mockReturnValue(mockQb);
      mockInvoiceRepository.count.mockResolvedValue(0);
      mockInvoiceRepository.find.mockResolvedValue([]);

      const result = await service.getDashboard('user-1');

      expect(result.todayHours).toBe(0);
    });
  });

  describe('getWeeklyChart', () => {
    it('should return 7 days of data', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-04T12:00:00Z'));

      const mockQb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '0' }),
      };
      mockTimeEntryRepository.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.getWeeklyChart('user-1');

      expect(result).toHaveLength(7);
      result.forEach((day: { date: string; hours: number }) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('hours');
      });

      jest.useRealTimers();
    });
  });

  describe('getPendingInvoices', () => {
    it('should return sent and overdue invoices', async () => {
      const invoices = [
        { id: 'inv-1', status: 'sent', client: { name: 'Acme' } },
        { id: 'inv-2', status: 'overdue', client: { name: 'Globex' } },
      ];
      mockInvoiceRepository.find.mockResolvedValue(invoices);

      const result = await service.getPendingInvoices('user-1');

      expect(result).toHaveLength(2);
      expect(mockInvoiceRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [
            { userId: 'user-1', status: 'sent' },
            { userId: 'user-1', status: 'overdue' },
          ],
        }),
      );
    });

    it('should return empty array when no pending invoices', async () => {
      mockInvoiceRepository.find.mockResolvedValue([]);

      const result = await service.getPendingInvoices('user-1');

      expect(result).toEqual([]);
    });
  });
});
