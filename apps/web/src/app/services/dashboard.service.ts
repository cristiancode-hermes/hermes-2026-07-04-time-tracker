import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { DashboardKPI, WeeklyChartData, TimeEntry } from '../interfaces';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  readonly kpiToday = signal<DashboardKPI | null>(null);
  readonly kpiWeek = signal<DashboardKPI | null>(null);
  readonly kpiPendingInvoices = signal<DashboardKPI | null>(null);
  readonly weeklyChart = signal<WeeklyChartData[]>([]);
  readonly recentEntries = signal<TimeEntry[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [kpis, chart, entries] = await Promise.all([
        firstValueFrom(this.http.get<{ today: DashboardKPI; week: DashboardKPI; pendingInvoices: DashboardKPI }>(
          `${environment.apiUrl}/dashboard/kpis`
        )),
        firstValueFrom(this.http.get<WeeklyChartData[]>(
          `${environment.apiUrl}/dashboard/weekly-chart`
        )),
        firstValueFrom(this.http.get<TimeEntry[]>(
          `${environment.apiUrl}/dashboard/recent-entries`
        )),
      ]);
      this.kpiToday.set(kpis.today);
      this.kpiWeek.set(kpis.week);
      this.kpiPendingInvoices.set(kpis.pendingInvoices);
      this.weeklyChart.set(chart);
      this.recentEntries.set(entries.slice(0, 5));
    } catch (err: any) {
      this.error.set(err.error?.message || 'Failed to load dashboard');
    } finally {
      this.loading.set(false);
    }
  }
}
