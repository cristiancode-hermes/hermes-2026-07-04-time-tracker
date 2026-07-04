import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity.js';
import {
  CreateTimeEntryDto,
  UpdateTimeEntryDto,
  QueryTimeEntryDto,
} from './dto/time-entry.dto.js';

@Injectable()
export class TimeEntriesService {
  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
  ) {}

  async findAll(userId: string, query: QueryTimeEntryDto) {
    const {
      from,
      to,
      projectId,
      clientId,
      search,
      page = 1,
      limit = 50,
    } = query;
    const where: any = { userId };

    if (from && to) {
      where.date = Between(from, to);
    } else if (from) {
      where.date = Between(from, '2099-12-31');
    } else if (to) {
      where.date = Between('2000-01-01', to);
    }

    if (projectId) where.projectId = projectId;
    if (search) {
      where.description = Like(`%${search}%`);
    }

    const qb = this.timeEntryRepository
      .createQueryBuilder('timeEntry')
      .leftJoinAndSelect('timeEntry.project', 'project')
      .leftJoinAndSelect('project.client', 'client')
      .where('timeEntry.userId = :userId', { userId });

    if (from && to) {
      qb.andWhere('timeEntry.date BETWEEN :from AND :to', { from, to });
    } else if (from) {
      qb.andWhere('timeEntry.date >= :from', { from });
    } else if (to) {
      qb.andWhere('timeEntry.date <= :to', { to });
    }

    if (projectId) {
      qb.andWhere('timeEntry.projectId = :projectId', { projectId });
    }

    if (clientId) {
      qb.andWhere('project.clientId = :clientId', { clientId });
    }

    if (search) {
      qb.andWhere('timeEntry.description LIKE :search', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('timeEntry.date', 'DESC')
      .addOrderBy('timeEntry.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const entry = await this.timeEntryRepository.findOne({
      where: { id, userId },
      relations: { project: { client: true } },
    });
    if (!entry) throw new NotFoundException('Time entry not found');
    return entry;
  }

  async create(userId: string, dto: CreateTimeEntryDto) {
    const entry = this.timeEntryRepository.create({
      ...dto,
      user: { id: userId } as any,
      userId,
      project: { id: dto.projectId } as any,
    });
    return this.timeEntryRepository.save(entry);
  }

  async update(id: string, userId: string, dto: UpdateTimeEntryDto) {
    const entry = await this.findOne(id, userId);
    Object.assign(entry, dto);
    if (dto.projectId) {
      entry.project = { id: dto.projectId } as any;
    }
    return this.timeEntryRepository.save(entry);
  }

  async remove(id: string, userId: string) {
    const entry = await this.findOne(id, userId);
    return this.timeEntryRepository.remove(entry);
  }
}
