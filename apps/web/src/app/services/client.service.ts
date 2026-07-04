import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Client } from '../interfaces';
import { ToastService } from './toast.service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadAll(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const clients = await firstValueFrom(
        this.http.get<Client[]>(`${environment.apiUrl}/clients`)
      );
      this.clients.set(clients);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Failed to load clients');
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string): Promise<Client | null> {
    try {
      return await firstValueFrom(
        this.http.get<Client>(`${environment.apiUrl}/clients/${id}`)
      );
    } catch {
      return null;
    }
  }

  async create(data: Partial<Client>): Promise<Client | null> {
    try {
      const client = await firstValueFrom(
        this.http.post<Client>(`${environment.apiUrl}/clients`, data)
      );
      this.clients.update(list => [...list, client]);
      this.toast.success('Client created');
      return client;
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to create client');
      return null;
    }
  }

  async update(id: string, data: Partial<Client>): Promise<Client | null> {
    try {
      const client = await firstValueFrom(
        this.http.put<Client>(`${environment.apiUrl}/clients/${id}`, data)
      );
      this.clients.update(list => list.map(c => c.id === id ? client : c));
      this.toast.success('Client updated');
      return client;
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to update client');
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/clients/${id}`)
      );
      this.clients.update(list => list.filter(c => c.id !== id));
      this.toast.success('Client deleted');
      return true;
    } catch {
      this.toast.error('Failed to delete client');
      return false;
    }
  }
}
