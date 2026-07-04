import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { ErrorStateComponent } from '../../shared/error-state/error-state.component';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, ErrorStateComponent, BadgeComponent, SkeletonComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p class="text-sm text-text-secondary mt-1">Overview of your time tracking activity</p>
      </div>

      @if (dashboardService.loading()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) {
            <app-skeleton type="card" />
          }
        </div>
        <app-skeleton type="title" />
      } @else if (dashboardService.error()) {
        <app-error-state [message]="dashboardService.error()!" (onRetry)="load()" />
      } @else {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @if (dashboardService.kpiToday(); as kpi) {
            <div class="bg-surface rounded-xl border border-border p-6 shadow-kpi">
              <p class="text-sm text-text-secondary mb-1">{{ kpi.label }}</p>
              <p class="text-3xl font-bold text-text-primary font-mono">{{ formatHours(kpi.value) }}</p>
              <p class="text-xs mt-1" [class.text-success-500]="kpi.delta >= 0" [class.text-danger-500]="kpi.delta < 0">
                {{ kpi.delta >= 0 ? '+' : '' }}{{ kpi.delta.toFixed(1) }}% {{ kpi.deltaLabel }}
              </p>
            </div>
          }
          @if (dashboardService.kpiWeek(); as kpi) {
            <div class="bg-surface rounded-xl border border-border p-6 shadow-kpi">
              <p class="text-sm text-text-secondary mb-1">{{ kpi.label }}</p>
              <p class="text-3xl font-bold text-text-primary font-mono">{{ formatHours(kpi.value) }}</p>
              <p class="text-xs mt-1" [class.text-success-500]="kpi.delta >= 0" [class.text-danger-500]="kpi.delta < 0">
                {{ kpi.delta >= 0 ? '+' : '' }}{{ kpi.delta.toFixed(1) }}% {{ kpi.deltaLabel }}
              </p>
            </div>
          }
          @if (dashboardService.kpiPendingInvoices(); as kpi) {
            <div class="bg-surface rounded-xl border border-border p-6 shadow-kpi">
              <p class="text-sm text-text-secondary mb-1">{{ kpi.label }}</p>
              <p class="text-3xl font-bold text-text-primary font-mono">{{ formatCurrency(kpi.value) }}</p>
              <p class="text-xs mt-1 text-text-tertiary">{{ kpi.deltaLabel }}</p>
            </div>
          }
        </div>

        <!-- Weekly Chart -->
        @if (dashboardService.weeklyChart(); as chart) {
          @if (chart.length > 0) {
            <div class="bg-surface rounded-xl border border-border p-6">
              <h2 class="text-lg font-semibold text-text-primary mb-4">This Week</h2>
              <div class="flex items-end gap-3 h-40">
                @for (day of chart; track day.day) {
                  <div class="flex-1 flex flex-col items-center gap-2">
                    <span class="text-xs text-text-tertiary">{{ formatHours(day.hours) }}</span>
                    <div
                      class="w-full rounded-t-lg transition-all duration-300"
                      [style.height.%]="(day.hours / maxChartHours()) * 100"
                      [class.bg-primary-500]="day.hours > 0"
                      [class.bg-surface-tertiary]="day.hours === 0"
                      [style.min-height]="day.hours > 0 ? '8px' : '4px'"
                    ></div>
                    <span class="text-xs text-text-tertiary">{{ day.shortDay }}</span>
                  </div>
                }
              </div>
            </div>
          }
        }

        <!-- Recent Entries -->
        <div class="bg-surface rounded-xl border border-border p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-text-primary">Recent Time Entries</h2>
            <a routerLink="/time-entries" class="text-sm text-primary-500 hover:text-primary-600">View all</a>
          </div>
          @if (dashboardService.recentEntries().length === 0) {
            <p class="text-sm text-text-secondary py-8 text-center">No recent time entries</p>
          } @else {
            <div class="space-y-3">
              @for (entry of dashboardService.recentEntries(); track entry.id) {
                <div class="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-text-primary truncate">{{ entry.description || entry.projectName }}</p>
                    <p class="text-xs text-text-tertiary">{{ entry.projectName }}</p>
                  </div>
                  <span class="text-sm font-mono font-medium text-text-primary">{{ formatDuration(entry.duration) }}</span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DashboardPageComponent {
  readonly dashboardService = inject(DashboardService);

  readonly maxChartHours = computed(() => {
    const chart = this.dashboardService.weeklyChart();
    const max = Math.max(...chart.map(d => d.hours), 1);
    return max * 1.2;
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.dashboardService.load();
  }

  formatHours(hours: number): string {
    return hours.toFixed(1) + 'h';
  }

  formatCurrency(amount: number): string {
    return '$' + amount.toFixed(2);
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
}
