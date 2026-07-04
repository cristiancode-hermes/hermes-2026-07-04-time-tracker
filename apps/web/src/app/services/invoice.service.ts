import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Invoice, InvoiceLineItem } from '../interfaces';
import { ToastService } from './toast.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly invoices = signal<Invoice[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly pendingInvoices = computed(() =>
    this.invoices().filter(i => i.status === 'draft' || i.status === 'sent')
  );

  readonly totalPendingAmount = computed(() =>
    this.pendingInvoices().reduce((sum, i) => sum + i.total, 0)
  );

  readonly overdueInvoices = computed(() =>
    this.invoices().filter(i => i.status === 'overdue')
  );

  async loadAll(filters?: { status?: string; clientId?: string }): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams();
      if (filters?.status) params = params.set('status', filters.status);
      if (filters?.clientId) params = params.set('clientId', filters.clientId);
      const invoices = await firstValueFrom(
        this.http.get<Invoice[]>(`${environment.apiUrl}/invoices`, { params })
      );
      this.invoices.set(invoices);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Failed to load invoices');
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string): Promise<Invoice | null> {
    try {
      return await firstValueFrom(
        this.http.get<Invoice>(`${environment.apiUrl}/invoices/${id}`)
      );
    } catch {
      return null;
    }
  }

  async create(data: {
    clientId: string;
    lineItems: InvoiceLineItem[];
    taxRate: number;
    notes?: string;
    dueDate: string;
    issuedDate: string;
  }): Promise<Invoice | null> {
    try {
      const invoice = await firstValueFrom(
        this.http.post<Invoice>(`${environment.apiUrl}/invoices`, data)
      );
      this.invoices.update(list => [...list, invoice]);
      this.toast.success(`Invoice ${invoice.invoiceNumber} created`);
      return invoice;
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to create invoice');
      return null;
    }
  }

  async updateStatus(id: string, status: Invoice['status']): Promise<Invoice | null> {
    try {
      const invoice = await firstValueFrom(
        this.http.patch<Invoice>(`${environment.apiUrl}/invoices/${id}/status`, { status })
      );
      this.invoices.update(list => list.map(i => i.id === id ? invoice : i));
      this.toast.success(`Invoice ${invoice.invoiceNumber} marked as ${status}`);
      return invoice;
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to update invoice');
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/invoices/${id}`)
      );
      this.invoices.update(list => list.filter(i => i.id !== id));
      this.toast.success('Invoice deleted');
      return true;
    } catch {
      this.toast.error('Failed to delete invoice');
      return false;
    }
  }
}
