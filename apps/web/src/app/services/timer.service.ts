import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { TimeEntry } from '../interfaces';
import { ToastService } from './toast.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly activeTimer = signal<{
    projectId: string;
    projectName: string;
    description: string;
    startedAt: string;
  } | null>(null);

  readonly isRunning = computed(() => this.activeTimer() !== null);
  readonly elapsedSeconds = signal(0);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Resume timer if it was running (from localStorage)
    const saved = localStorage.getItem('activeTimer');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.activeTimer.set(parsed);
        const startedAt = new Date(parsed.startedAt).getTime();
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        this.elapsedSeconds.set(elapsed);
        this.startInterval();
      } catch {
        localStorage.removeItem('activeTimer');
      }
    }
  }

  private startInterval(): void {
    this.stopInterval();
    this.intervalId = setInterval(() => {
      this.elapsedSeconds.update(s => s + 1);
    }, 1000);
  }

  private stopInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  get elapsedFormatted(): string {
    const total = this.elapsedSeconds();
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  startTimer(projectId: string, projectName: string, description: string = ''): void {
    if (this.isRunning()) {
      this.toast.warning('A timer is already running');
      return;
    }
    const now = new Date();
    const timer = {
      projectId,
      projectName,
      description,
      startedAt: now.toISOString(),
    };
    this.activeTimer.set(timer);
    this.elapsedSeconds.set(0);
    localStorage.setItem('activeTimer', JSON.stringify(timer));
    this.startInterval();
    this.toast.success(`Timer started for ${projectName}`);
  }

  async stopTimer(): Promise<TimeEntry | null> {
    const timer = this.activeTimer();
    if (!timer) return null;

    this.stopInterval();
    this.activeTimer.set(null);
    localStorage.removeItem('activeTimer');

    const endTime = new Date();
    const duration = this.elapsedSeconds();

    try {
      const entry = await firstValueFrom(
        this.http.post<TimeEntry>(`${environment.apiUrl}/time-entries`, {
          projectId: timer.projectId,
          description: timer.description,
          startTime: timer.startedAt,
          endTime: endTime.toISOString(),
          duration,
          billable: true,
        })
      );
      this.toast.success(`Time entry saved: ${this.elapsedFormatted}`);
      return entry;
    } catch {
      this.toast.error('Failed to save time entry');
      return null;
    }
  }
}
