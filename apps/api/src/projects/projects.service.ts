import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Project } from '../entities/project.entity.js';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(
    userId: string,
    query: {
      clientId?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { clientId, status, search, page = 1, limit = 20 } = query;
    const where: any = { userId };

    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [data, total] = await this.projectRepository.findAndCount({
      where,
      relations: { client: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id, userId },
      relations: { client: true, timeEntries: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(userId: string, dto: CreateProjectDto) {
    const project = this.projectRepository.create({
      ...dto,
      user: { id: userId } as any,
      userId,
      client: { id: dto.clientId } as any,
    });
    return this.projectRepository.save(project);
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.findOne(id, userId);
    Object.assign(project, dto);
    if (dto.clientId) {
      project.client = { id: dto.clientId } as any;
    }
    return this.projectRepository.save(project);
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id, userId);
    return this.projectRepository.remove(project);
  }
}
