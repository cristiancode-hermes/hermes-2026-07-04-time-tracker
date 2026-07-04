import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TimeEntriesService } from './time-entries.service';
import { TimeEntry } from '../entities/time-entry.entity';

describe('TimeEntriesService', () => {
  let service: TimeEntriesService;
  let repository: Repository<TimeEntry>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeEntriesService,
        {
          provide: getRepositoryToken(TimeEntry),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TimeEntriesService>(TimeEntriesService);
    repository = module.get<Repository<TimeEntry>>(getRepositoryToken(TimeEntry));
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated time entries', async () => {
      const mockData = [
        {
          id: 'entry-1',
          duration: 2.5,
          date: '2026-07-04',
          project: { id: 'proj-1', name: 'Project A', client: { name: 'Client A' } },
        },
      ];
      mockRepository.createQueryBuilder = jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockData, 1]),
      })) as any;

      const result = await service.findAll('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply date filters', async () => {
      const qbMethods = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockRepository.createQueryBuilder = jest.fn(() => qbMethods) as any;

      await service.findAll('user-1', { from: '2026-01-01', to: '2026-12-31' });

      expect(qbMethods.andWhere).toHaveBeenCalledWith(
        'timeEntry.date BETWEEN :from AND :to',
        { from: '2026-01-01', to: '2026-12-31' },
      );
    });
  });

  describe('create', () => {
    it('should create a time entry', async () => {
      const dto = {
        description: 'Test entry',
        duration: 2.5,
        date: '2026-07-04',
        billable: true,
        projectId: 'proj-1',
      };

      mockRepository.create.mockReturnValue({ id: 'new-entry', ...dto });
      mockRepository.save.mockResolvedValue({ id: 'new-entry', ...dto });

      const result = await service.create('user-1', dto);
      expect(result).toHaveProperty('id', 'new-entry');
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a time entry by id', async () => {
      const entry = {
        id: 'entry-1',
        duration: 2.5,
        project: { client: {} },
      };
      mockRepository.findOne.mockResolvedValue(entry);

      const result = await service.findOne('entry-1', 'user-1');
      expect(result.id).toBe('entry-1');
    });

    it('should throw if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
