import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TimeEntryService } from '../../services/time-entry.service';
import { TimerService } from '../../services/timer.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/error-state/error-state.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-time-entries-page',
  standalone: true,
  imports: [RouterLink, FormsModule, SpinnerComponent, EmptyStateComponent, ErrorStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-text-primary">Time Entries</h1>
        <div class="flex gap-2">
          <button (click)="showTimerModal.set(true)" class="px-4 py-2 text-sm font-medium rounded-lg bg-accent-500 text-white hover:bg-accent-600">Start Timer</button>
          <button (click)="showEntryForm.set(true)" class="px-4 py-2 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600">+ Manual Entry</button>
        </div>
      </div>
      @if (timerService.isRunning()) {
        <div class="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-xl p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-accent-600 dark:text-accent-400">ACTIVE TIMER</p>
              <p class="text-3xl font-mono font-bold text-text-primary mt-1">{{ timerService.elapsedFormatted }}</p>
              <p class="text-sm text-accent-600 dark:text-accent-400 mt-1">{{ timerService.activeTimer()?.projectName }}</p>
            </div>
            <button (click)="stopTimer()" class="px-5 py-2.5 text-sm font-medium rounded-lg bg-danger-500 text-white hover:bg-danger-600">Stop</button>
          </div>
        </div>
      }
      <div class="flex gap-3">
        <input [(ngModel)]="dateFrom" type="date" class="px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary" />
        <input [(ngModel)]="dateTo" type="date" class="px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary" />
      </div>
      @if (timeEntryService.loading()) { <app-spinner label="Loading entries..." /> }
      @else if (timeEntryService.error()) { <app-error-state [message]="timeEntryService.error()!" (onRetry)="load()" /> }
      @else if (timeEntryService.entries().length === 0) { <app-empty-state icon="⏱" title="No time entries yet" message="Start tracking your time to see entries here." /> }
      @else {
        <div class="bg-surface rounded-xl border border-border overflow-hidden">
          <table class="w-full">
            <thead><tr class="border-b border-border bg-surface-secondary">
              <th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase">Date</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase">Project</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase">Description</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase">Duration</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase">Actions</th>
            </tr></thead>
            <tbody>
              @for (entry of timeEntryService.entries(); track entry.id) {
                <tr class="border-b border-border last:border-0 hover:bg-surface-secondary">
                  <td class="px-4 py-3 text-sm text-text-primary font-mono">{{ entry.startTime?.substring(0, 10) || entry.startTime }}</td>
                  <td class="px-4 py-3 text-sm text-text-primary">{{ entry.projectName }}</td>
                  <td class="px-4 py-3 text-sm text-text-secondary max-w-xs truncate">{{ entry.description || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-right font-mono text-text-primary">{{ entry.duration.toFixed(1) }}h</td>
                  <td class="px-4 py-3 text-right"><button (click)="timeEntryService.delete(entry.id)" class="text-sm text-danger-500 hover:text-danger-600">Delete</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      @if (showTimerModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="showTimerModal.set(false)"></div>
          <div class="relative w-full max-w-md bg-surface rounded-2xl shadow-modal border border-border p-6">
            <h3 class="text-lg font-semibold text-text-primary mb-4">Start Timer</h3>
            <div class="space-y-4">
              <div><label class="block text-sm font-medium text-text-primary mb-1">Project ID</label><input [(ngModel)]="timerProjectId" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary"/></div>
              <div><label class="block text-sm font-medium text-text-primary mb-1">Description</label><input [(ngModel)]="timerDesc" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary"/></div>
              <div class="flex gap-3 justify-end">
                <button (click)="showTimerModal.set(false)" class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-primary">Cancel</button>
                <button (click)="startTimer()" [disabled]="!timerProjectId()" class="px-4 py-2 text-sm font-medium rounded-lg bg-primary-500 text-white disabled:opacity-50">Start</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TimeEntriesPageComponent {
  readonly timeEntryService = inject(TimeEntryService);
  readonly timerService = inject(TimerService);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  readonly showTimerModal = signal(false);
  readonly showEntryForm = signal(false);
  readonly timerProjectId = signal('');
  readonly timerDesc = signal('');

  constructor() { this.timeEntryService.loadAll(); }
  load(): void { this.timeEntryService.loadAll(); }
  startTimer(): void { if (this.timerProjectId()) { this.timerService.startTimer(this.timerProjectId(), '', this.timerDesc()); this.showTimerModal.set(false); } }
  async stopTimer(): Promise<void> { await this.timerService.stopTimer(); }
}
