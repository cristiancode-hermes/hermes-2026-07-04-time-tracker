import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClientsService } from './clients.service';
import { Client } from '../entities/client.entity';

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: Repository<Client>;

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
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    repository = module.get<Repository<Client>>(getRepositoryToken(Client));
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated clients', async () => {
      const mockData = [
        { id: 'client-1', name: 'Acme Corp', email: 'acme@example.com', company: 'Acme' },
        { id: 'client-2', name: 'Globex', email: 'globex@example.com', company: 'Globex' },
      ];
      mockRepository.findAndCount.mockResolvedValue([mockData, 2]);

      const result = await service.findAll('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should apply search filter', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-1', { search: 'Acme' });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            name: expect.any(Object), // Like operator
          }),
        }),
      );
    });

    it('should return empty array when no clients', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll('user-1', {});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a client with projects relation', async () => {
      const client = {
        id: 'client-1',
        name: 'Acme Corp',
        projects: [{ id: 'proj-1' }],
      };
      mockRepository.findOne.mockResolvedValue(client);

      const result = await service.findOne('client-1', 'user-1');

      expect(result.id).toBe('client-1');
      expect(result.projects).toHaveLength(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'client-1', userId: 'user-1' },
        relations: { projects: true },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const dto = {
        name: 'Acme Corp',
        email: 'contact@acme.com',
        company: 'Acme',
        phone: '+1234567890',
      };
      mockRepository.create.mockReturnValue({ id: 'new-client', ...dto, userId: 'user-1' });
      mockRepository.save.mockResolvedValue({ id: 'new-client', ...dto, userId: 'user-1' });

      const result = await service.create('user-1', dto);

      expect(result).toHaveProperty('id', 'new-client');
      expect(result.name).toBe('Acme Corp');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ...dto, userId: 'user-1' }),
      );
    });
  });

  describe('update', () => {
    it('should update an existing client', async () => {
      const existingClient = { id: 'client-1', name: 'Old Name', save: jest.fn() };
      mockRepository.findOne.mockResolvedValue(existingClient);
      mockRepository.save.mockResolvedValue({ ...existingClient, name: 'New Name' });

      const result = await service.update('client-1', 'user-1', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'client-1', userId: 'user-1' },
        relations: { projects: true },
      });
    });

    it('should throw NotFoundException when updating non-existent client', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', 'user-1', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an existing client', async () => {
      const client = { id: 'client-1', name: 'Acme Corp' };
      mockRepository.findOne.mockResolvedValue(client);
      mockRepository.remove.mockResolvedValue(client);

      const result = await service.remove('client-1', 'user-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(client);
    });

    it('should throw NotFoundException when removing non-existent client', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
