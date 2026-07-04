import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity.js';
import { Invoice } from '../entities/invoice.entity.js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async getSummary(
    userId: string,
    query: { from: string; to: string },
  ) {
    const { from, to } = query;

    const totalHours = await this.getHoursInRange(userId, from, to);
    const billableHours = await this.getBillableHoursInRange(userId, from, to);

    const timeEntries = await this.timeEntryRepository
      .createQueryBuilder('te')
      .leftJoinAndSelect('te.project', 'project')
      .leftJoinAndSelect('project.client', 'client')
      .where('te.userId = :userId', { userId })
      .andWhere('te.date BETWEEN :from AND :to', { from, to })
      .orderBy('te.date', 'ASC')
      .getMany();

    // Group by project
    const byProject: Record<
      string,
      { projectName: string; clientName: string; hours: number; billableHours: number; amount: number }
    > = {};

    for (const entry of timeEntries) {
      const key = entry.projectId;
      if (!byProject[key]) {
        byProject[key] = {
          projectName: (entry.project as any)?.name ?? 'Unknown',
          clientName: (entry.project as any)?.client?.name ?? 'Unknown',
          hours: 0,
          billableHours: 0,
          amount: 0,
        };
      }
      byProject[key].hours += entry.duration;
      if (entry.billable) {
        byProject[key].billableHours += entry.duration;
        byProject[key].amount +=
          entry.duration * ((entry.project as any)?.hourlyRate ?? 0);
      }
    }

    const invoicesInRange = await this.invoiceRepository.find({
      where: { userId },
      relations: { client: true },
    });

    const totalInvoiced = invoicesInRange
      .filter((inv) => inv.status !== 'draft')
      .reduce((sum, inv) => sum + inv.total, 0);

    return {
      period: { from, to },
      totalHours: Math.round(totalHours * 100) / 100,
      billableHours: Math.round(billableHours * 100) / 100,
      nonBillableHours: Math.round((totalHours - billableHours) * 100) / 100,
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      entriesCount: timeEntries.length,
      byProject: Object.values(byProject),
    };
  }

  async exportCsv(
    userId: string,
    query: { from: string; to: string },
  ): Promise<string> {
    const { from, to } = query;
    const entries = await this.timeEntryRepository
      .createQueryBuilder('te')
      .leftJoinAndSelect('te.project', 'project')
      .leftJoinAndSelect('project.client', 'client')
      .where('te.userId = :userId', { userId })
      .andWhere('te.date BETWEEN :from AND :to', { from, to })
      .orderBy('te.date', 'ASC')
      .getMany();

    const header = 'Date,Description,Duration (h),Project,Client,Billable,Invoiced\n';
    const rows = entries
      .map((e) => {
        const projectName = (e.project as any)?.name ?? '';
        const clientName = (e.project as any)?.client?.name ?? '';
        return `${e.date},${this.escapeCsv(e.description ?? '')},${e.duration},${this.escapeCsv(projectName)},${this.escapeCsv(clientName)},${e.billable ? 'Yes' : 'No'},${e.invoiced ? 'Yes' : 'No'}`;
      })
      .join('\n');

    return header + rows;
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private async getHoursInRange(
    userId: string,
    from: string,
    to: string,
  ): Promise<number> {
    const result = await this.timeEntryRepository
      .createQueryBuilder('te')
      .select('COALESCE(SUM(te.duration), 0)', 'total')
      .where('te.userId = :userId', { userId })
      .andWhere('te.date BETWEEN :from AND :to', { from, to })
      .getRawOne();
    return parseFloat(result?.total ?? '0');
  }

  private async getBillableHoursInRange(
    userId: string,
    from: string,
    to: string,
  ): Promise<number> {
    const result = await this.timeEntryRepository
      .createQueryBuilder('te')
      .select('COALESCE(SUM(te.duration), 0)', 'total')
      .where('te.userId = :userId', { userId })
      .andWhere('te.date BETWEEN :from AND :to', { from, to })
      .andWhere('te.billable = :billable', { billable: true })
      .getRawOne();
    return parseFloat(result?.total ?? '0');
  }
}
