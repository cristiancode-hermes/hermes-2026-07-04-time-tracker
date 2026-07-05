import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProjectsService } from './projects.service';
import { Project } from '../entities/project.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: Repository<Project>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repository = module.get<Repository<Project>>(getRepositoryToken(Project));
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated projects with client relation', async () => {
      const mockData = [
        { id: 'proj-1', name: 'Website Redesign', status: 'active', client: { id: 'client-1', name: 'Acme Corp' } },
        { id: 'proj-2', name: 'Mobile App', status: 'active', client: { id: 'client-2', name: 'Globex' } },
      ];
      mockRepository.findAndCount.mockResolvedValue([mockData, 2]);

      const result = await service.findAll('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          relations: { client: true },
        }),
      );
    });

    it('should filter by clientId', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-1', { clientId: 'client-1' });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clientId: 'client-1' }),
        }),
      );
    });

    it('should filter by status', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-1', { status: 'active' });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'active' }),
        }),
      );
    });

    it('should return empty array when no projects', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll('user-1', {});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a project with client and timeEntries relations', async () => {
      const project = {
        id: 'proj-1',
        name: 'Website Redesign',
        client: { id: 'client-1', name: 'Acme' },
        timeEntries: [{ id: 'entry-1' }],
      };
      mockRepository.findOne.mockResolvedValue(project);

      const result = await service.findOne('proj-1', 'user-1');

      expect(result.id).toBe('proj-1');
      expect(result.client.name).toBe('Acme');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'proj-1', userId: 'user-1' },
        relations: { client: true, timeEntries: true },
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new project with client relation', async () => {
      const dto = {
        name: 'Website Redesign',
        description: 'Full redesign',
        hourlyRate: 150,
        status: 'active' as const,
        clientId: 'client-1',
      };
      const created = {
        id: 'new-proj',
        ...dto,
        userId: 'user-1',
        client: { id: 'client-1' },
      };
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      const result = await service.create('user-1', dto);

      expect(result).toHaveProperty('id', 'new-proj');
      expect(result.name).toBe('Website Redesign');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          userId: 'user-1',
          clientId: 'client-1',
        }),
      );
    });
  });

  describe('update', () => {
    it('should update an existing project', async () => {
      const existing = {
        id: 'proj-1',
        name: 'Old Name',
        hourlyRate: 100,
      };
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockResolvedValue({ ...existing, name: 'New Name', hourlyRate: 120 });

      const result = await service.update('proj-1', 'user-1', {
        name: 'New Name',
        hourlyRate: 120,
      });

      expect(result.name).toBe('New Name');
      expect(result.hourlyRate).toBe(120);
    });

    it('should throw NotFoundException when updating non-existent project', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', 'user-1', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an existing project', async () => {
      const project = { id: 'proj-1', name: 'Website' };
      mockRepository.findOne.mockResolvedValue(project);
      mockRepository.remove.mockResolvedValue(project);

      const result = await service.remove('proj-1', 'user-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(project);
    });

    it('should throw NotFoundException when removing non-existent project', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
