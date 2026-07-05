import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportsService } from './reports.service';
import { TimeEntry } from '../entities/time-entry.entity';
import { Invoice } from '../entities/invoice.entity';

describe('ReportsService', () => {
  let service: ReportsService;
  let timeEntryRepository: Repository<TimeEntry>;
  let invoiceRepository: Repository<Invoice>;

  const mockTimeEntryRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockInvoiceRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
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

    service = module.get<ReportsService>(ReportsService);
    timeEntryRepository = module.get<Repository<TimeEntry>>(getRepositoryToken(TimeEntry));
    invoiceRepository = module.get<Repository<Invoice>>(getRepositoryToken(Invoice));
    jest.clearAllMocks();
  });

  function mockQueryBuilder(overrides: Record<string, jest.Mock> = {}) {
    return {
      select: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getRawOne: jest.fn().mockResolvedValue({ total: '0' }),
      ...overrides,
    };
  }

  describe('getSummary', () => {
    it('should return period summary with project grouping', async () => {
      const mockQb = mockQueryBuilder({
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'entry-1',
            duration: 2.5,
            date: '2026-07-01',
            billable: true,
            projectId: 'proj-1',
            project: { name: 'Website', hourlyRate: 100, client: { name: 'Acme' } },
          },
          {
            id: 'entry-2',
            duration: 1.5,
            date: '2026-07-02',
            billable: false,
            projectId: 'proj-1',
            project: { name: 'Website', hourlyRate: 100, client: { name: 'Acme' } },
          },
        ]),
      });
      // First call is getHoursInRange, second is getBillableHoursInRange, third is getMany
      const mockQbSum = mockQueryBuilder();
      mockTimeEntryRepository.createQueryBuilder
        .mockReturnValueOnce(mockQbSum)  // getHoursInRange
        .mockReturnValueOnce(mockQbSum)  // getBillableHoursInRange
        .mockReturnValueOnce(mockQb);    // getMany for entries
      mockInvoiceRepository.find.mockResolvedValue([]);

      const result = await service.getSummary('user-1', {
        from: '2026-07-01',
        to: '2026-07-31',
      });

      expect(result).toHaveProperty('period');
      expect(result.period.from).toBe('2026-07-01');
      expect(result.period.to).toBe('2026-07-31');
      expect(result.entriesCount).toBe(2);
      expect(result.byProject).toHaveLength(1);
      expect(result.byProject[0].projectName).toBe('Website');
      expect(result.byProject[0].clientName).toBe('Acme');
      expect(result.byProject[0].hours).toBe(4); // 2.5 + 1.5
      expect(result.byProject[0].billableHours).toBe(2.5);
    });

    it('should calculate non-billable hours correctly', async () => {
      const mockQb = mockQueryBuilder({
        getMany: jest.fn().mockResolvedValue([]),
      });
      const mockQbSum = mockQueryBuilder({
        getRawOne: jest.fn().mockResolvedValue({ total: '10' }),
      });
      const mockQbBillable = mockQueryBuilder({
        getRawOne: jest.fn().mockResolvedValue({ total: '6' }),
      });
      mockTimeEntryRepository.createQueryBuilder
        .mockReturnValueOnce(mockQbSum)      // getHoursInRange (10)
        .mockReturnValueOnce(mockQbBillable) // getBillableHoursInRange (6)
        .mockReturnValueOnce(mockQb);        // getMany
      mockInvoiceRepository.find.mockResolvedValue([]);

      const result = await service.getSummary('user-1', {
        from: '2026-07-01',
        to: '2026-07-31',
      });

      expect(result.totalHours).toBe(10);
      expect(result.billableHours).toBe(6);
      expect(result.nonBillableHours).toBe(4);
    });

    it('should include total invoiced from non-draft invoices', async () => {
      const mockQbSum = mockQueryBuilder();
      mockTimeEntryRepository.createQueryBuilder
        .mockReturnValueOnce(mockQbSum)
        .mockReturnValueOnce(mockQbSum)
        .mockReturnValueOnce(mockQueryBuilder({ getMany: jest.fn().mockResolvedValue([]) }));

      mockInvoiceRepository.find.mockResolvedValue([
        { id: 'inv-1', status: 'sent', total: 1500 },
        { id: 'inv-2', status: 'paid', total: 2500 },
        { id: 'inv-3', status: 'draft', total: 500 },
      ]);

      const result = await service.getSummary('user-1', {
        from: '2026-07-01',
        to: '2026-07-31',
      });

      expect(result.totalInvoiced).toBe(4000); // 1500 + 2500, excludes draft
    });
  });

  describe('exportCsv', () => {
    it('should generate CSV with header and rows', async () => {
      const mockQb = mockQueryBuilder({
        getMany: jest.fn().mockResolvedValue([
          {
            date: '2026-07-01',
            description: 'Design work',
            duration: 2.5,
            billable: true,
            invoiced: false,
            project: { name: 'Website', client: { name: 'Acme' } },
          },
          {
            date: '2026-07-02',
            description: 'Meeting',
            duration: 1.0,
            billable: true,
            invoiced: true,
            project: { name: 'Mobile App', client: { name: 'Globex' } },
          },
        ]),
      });
      mockTimeEntryRepository.createQueryBuilder.mockReturnValue(mockQb);

      const csv = await service.exportCsv('user-1', {
        from: '2026-07-01',
        to: '2026-07-31',
      });

      expect(csv).toContain('Date,Description,Duration (h),Project,Client,Billable,Invoiced');
      expect(csv).toContain('2026-07-01');
      expect(csv).toContain('Design work');
      expect(csv).toContain('Website');
      expect(csv).toContain('Acme');
    });

    it('should escape commas and quotes in CSV fields', async () => {
      const mockQb = mockQueryBuilder({
        getMany: jest.fn().mockResolvedValue([
          {
            date: '2026-07-01',
            description: 'Has, comma and "quote"',
            duration: 1.0,
            billable: true,
            invoiced: false,
            project: { name: 'Project, Inc.', client: { name: 'Client & Co' } },
          },
        ]),
      });
      mockTimeEntryRepository.createQueryBuilder.mockReturnValue(mockQb);

      const csv = await service.exportCsv('user-1', {
        from: '2026-07-01',
        to: '2026-07-31',
      });

      expect(csv).toContain('"Has, comma and ""quote"""');
      expect(csv).toContain('"Project, Inc."');
    });

    it('should return only header when no entries exist', async () => {
      const mockQb = mockQueryBuilder({
        getMany: jest.fn().mockResolvedValue([]),
      });
      mockTimeEntryRepository.createQueryBuilder.mockReturnValue(mockQb);

      const csv = await service.exportCsv('user-1', {
        from: '2026-07-01',
        to: '2026-07-31',
      });

      expect(csv).toBe('Date,Description,Duration (h),Project,Client,Billable,Invoiced\n');
    });
  });
});
