import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { TimeEntry } from '../interfaces';
import { ToastService } from './toast.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimeEntryService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly entries = signal<TimeEntry[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly todayTotal = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.entries()
      .filter(e => e.startTime.startsWith(today))
      .reduce((sum, e) => sum + e.duration, 0);
  });

  readonly weekTotal = computed(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const start = startOfWeek.toISOString().split('T')[0];
    return this.entries()
      .filter(e => e.startTime >= start)
      .reduce((sum, e) => sum + e.duration, 0);
  });

  readonly billableTotal = computed(() => {
    return this.entries()
      .filter(e => e.billable)
      .reduce((sum, e) => sum + e.duration, 0);
  });

  readonly unInvoicedEntries = computed(() => {
    return this.entries().filter(e => !e.invoiced);
  });

  async loadAll(filters?: { projectId?: string; clientId?: string; startDate?: string; endDate?: string; invoiced?: boolean }): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams();
      if (filters?.projectId) params = params.set('projectId', filters.projectId);
      if (filters?.clientId) params = params.set('clientId', filters.clientId);
      if (filters?.startDate) params = params.set('startDate', filters.startDate);
      if (filters?.endDate) params = params.set('endDate', filters.endDate);
      if (filters?.invoiced !== undefined) params = params.set('invoiced', filters.invoiced);
      const entries = await firstValueFrom(
        this.http.get<TimeEntry[]>(`${environment.apiUrl}/time-entries`, { params })
      );
      this.entries.set(entries);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Failed to load time entries');
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string): Promise<TimeEntry | null> {
    try {
      return await firstValueFrom(
        this.http.get<TimeEntry>(`${environment.apiUrl}/time-entries/${id}`)
      );
    } catch {
      return null;
    }
  }

  async create(data: Partial<TimeEntry>): Promise<TimeEntry | null> {
    try {
      const entry = await firstValueFrom(
        this.http.post<TimeEntry>(`${environment.apiUrl}/time-entries`, data)
      );
      this.entries.update(list => [...list, entry]);
      return entry;
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to create time entry');
      return null;
    }
  }

  async update(id: string, data: Partial<TimeEntry>): Promise<TimeEntry | null> {
    try {
      const entry = await firstValueFrom(
        this.http.put<TimeEntry>(`${environment.apiUrl}/time-entries/${id}`, data)
      );
      this.entries.update(list => list.map(e => e.id === id ? entry : e));
      this.toast.success('Time entry updated');
      return entry;
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to update time entry');
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/time-entries/${id}`)
      );
      this.entries.update(list => list.filter(e => e.id !== id));
      this.toast.success('Time entry deleted');
      return true;
    } catch {
      this.toast.error('Failed to delete time entry');
      return false;
    }
  }

  async getEntriesForInvoice(clientId: string, projectIds?: string[]): Promise<TimeEntry[]> {
    let params = new HttpParams().set('clientId', clientId).set('invoiced', 'false');
    if (projectIds?.length) {
      projectIds.forEach(id => {
        params = params.append('projectId', id);
      });
    }
    try {
      return await firstValueFrom(
        this.http.get<TimeEntry[]>(`${environment.apiUrl}/time-entries`, { params })
      );
    } catch {
      return [];
    }
  }

  async markAsInvoiced(entryIds: string[], invoiceId: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/time-entries/invoice`, { entryIds, invoiceId })
      );
      this.entries.update(list =>
        list.map(e => entryIds.includes(e.id) ? { ...e, invoiced: true, invoiceId } : e)
      );
      return true;
    } catch {
      return false;
    }
  }
}
