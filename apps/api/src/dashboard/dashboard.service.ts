import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity.js';
import { Invoice } from '../entities/invoice.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async getDashboard(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const todayHours = await this.getHoursInRange(userId, today, today);
    const weekHours = await this.getHoursInRange(
      userId,
      startOfWeekStr,
      today,
    );
    const monthHours = await this.getHoursInRange(
      userId,
      startOfMonth,
      today,
    );

    const pendingInvoices = await this.invoiceRepository.count({
      where: { userId, status: 'sent' },
    });

    const overdueInvoices = await this.invoiceRepository.count({
      where: { userId, status: 'overdue' },
    });

    return {
      todayHours,
      weekHours,
      monthHours,
      pendingInvoices,
      overdueInvoices,
    };
  }

  async getWeeklyChart(userId: string) {
    const now = new Date();
    const days: { date: string; hours: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hours = await this.getHoursInRange(userId, dateStr, dateStr);
      days.push({ date: dateStr, hours });
    }

    return days;
  }

  async getPendingInvoices(userId: string) {
    return this.invoiceRepository.find({
      where: [
        { userId, status: 'sent' },
        { userId, status: 'overdue' },
      ],
      relations: { client: true },
      order: { dueDate: 'ASC' },
    });
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
}
