import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { User } from '../interfaces';
import { ToastService } from './toast.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly user = signal<User | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isAuthenticated = computed(() => this.user() !== null);

  constructor() {}

  async login(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(
        this.http.post<{ user: User; token: string }>(`${environment.apiUrl}/auth/login`, { email, password })
      );
      localStorage.setItem('token', result.token);
      this.user.set(result.user);
      this.toast.success('Logged in successfully');
      return true;
    } catch (err: any) {
      this.error.set(err.error?.message || 'Login failed');
      this.toast.error('Login failed');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async register(name: string, email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(
        this.http.post<{ user: User; token: string }>(`${environment.apiUrl}/auth/register`, { name, email, password })
      );
      localStorage.setItem('token', result.token);
      this.user.set(result.user);
      this.toast.success('Account created successfully');
      return true;
    } catch (err: any) {
      this.error.set(err.error?.message || 'Registration failed');
      this.toast.error('Registration failed');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    this.user.set(null);
    this.router.navigate(['/login']);
    this.toast.info('Logged out');
  }

  async checkAuth(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const user = await firstValueFrom(
        this.http.get<User>(`${environment.apiUrl}/auth/me`)
      );
      this.user.set(user);
    } catch {
      localStorage.removeItem('token');
    }
  }
}
