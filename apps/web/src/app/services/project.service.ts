import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Project } from '../interfaces';
import { ToastService } from './toast.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly projects = signal<Project[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadAll(filters?: { clientId?: string; status?: string; search?: string }): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams();
      if (filters?.clientId) params = params.set('clientId', filters.clientId);
      if (filters?.status) params = params.set('status', filters.status);
      if (filters?.search) params = params.set('search', filters.search);
      const projects = await firstValueFrom(
        this.http.get<Project[]>(`${environment.apiUrl}/projects`, { params })
      );
      this.projects.set(projects);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Failed to load projects');
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string): Promise<Project | null> {
    try {
      return await firstValueFrom(
        this.http.get<Project>(`${environment.apiUrl}/projects/${id}`)
      );
    } catch {
      return null;
    }
  }

  async getByClientId(clientId: string): Promise<Project[]> {
    try {
      return await firstValueFrom(
        this.http.get<Project[]>(`${environment.apiUrl}/projects`, {
          params: new HttpParams().set('clientId', clientId)
        })
      );
    } catch {
      return [];
    }
  }

  async create(data: Partial<Project>): Promise<Project | null> {
    try {
      const project = await firstValueFrom(
        this.http.post<Project>(`${environment.apiUrl}/projects`, data)
      );
      this.projects.update(list => [...list, project]);
      this.toast.success('Project created');
      return project;
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to create project');
      return null;
    }
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    try {
      const project = await firstValueFrom(
        this.http.put<Project>(`${environment.apiUrl}/projects/${id}`, data)
      );
      this.projects.update(list => list.map(p => p.id === id ? project : p));
      this.toast.success('Project updated');
      return project;
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to update project');
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/projects/${id}`)
      );
      this.projects.update(list => list.filter(p => p.id !== id));
      this.toast.success('Project deleted');
      return true;
    } catch {
      this.toast.error('Failed to delete project');
      return false;
    }
  }
}
