import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Client } from '../entities/client.entity.js';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto.js';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async findAll(
    userId: string,
    query: { search?: string; page?: number; limit?: number },
  ) {
    const { search, page = 1, limit = 20 } = query;
    const where: any = { userId };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [data, total] = await this.clientRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const client = await this.clientRepository.findOne({
      where: { id, userId },
      relations: { projects: true },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(userId: string, dto: CreateClientDto) {
    const client = this.clientRepository.create({
      ...dto,
      user: { id: userId } as any,
      userId,
    });
    return this.clientRepository.save(client);
  }

  async update(id: string, userId: string, dto: UpdateClientDto) {
    const client = await this.findOne(id, userId);
    Object.assign(client, dto);
    return this.clientRepository.save(client);
  }

  async remove(id: string, userId: string) {
    const client = await this.findOne(id, userId);
    return this.clientRepository.remove(client);
  }
}
