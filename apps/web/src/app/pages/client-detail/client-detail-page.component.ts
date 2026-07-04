import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { ProjectService } from '../../services/project.service';
import { TimeEntryService } from '../../services/time-entry.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { ErrorStateComponent } from '../../shared/error-state/error-state.component';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-client-detail-page',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, ErrorStateComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/clients" class="text-sm text-text-tertiary hover:text-text-primary">&larr; Back to Clients</a>
      </div>

      @if (loading()) {
        <app-spinner label="Loading client..." />
      } @else if (error()) {
        <app-error-state [message]="error()!" (onRetry)="load()" />
      } @else if (client(); as c) {
        <!-- Client Header -->
        <div class="bg-surface rounded-xl border border-border p-6">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-2xl font-bold text-text-primary">{{ c.name }}</h1>
              <p class="text-sm text-text-secondary mt-1">{{ c.email }}</p>
              @if (c.company) {
                <p class="text-sm text-text-secondary">{{ c.company }}</p>
              }
            </div>
            <a [routerLink]="['/clients', c.id, 'edit']" class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-primary hover:bg-surface-tertiary">
              Edit
            </a>
          </div>
          @if (c.phone || c.notes) {
            <div class="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-sm">
              @if (c.phone) {
                <div><span class="text-text-tertiary">Phone:</span> {{ c.phone }}</div>
              }
              @if (c.notes) {
                <div class="col-span-2"><span class="text-text-tertiary">Notes:</span> {{ c.notes }}</div>
              }
            </div>
          }
        </div>

        <!-- Projects -->
        <div class="bg-surface rounded-xl border border-border p-6">
          <h2 class="text-lg font-semibold text-text-primary mb-4">Projects</h2>
          @if (projects().length === 0) {
            <p class="text-sm text-text-secondary py-4 text-center">No projects for this client</p>
          } @else {
            <div class="space-y-2">
              @for (p of projects(); track p.id) {
                <a [routerLink]="['/projects', p.id]" class="flex items-center justify-between p-3 rounded-lg hover:bg-surface-secondary transition-colors">
                  <div>
                    <p class="text-sm font-medium text-text-primary">{{ p.name }}</p>
                    <p class="text-xs text-text-tertiary">\${{ p.hourlyRate }}/hr</p>
                  </div>
                  <app-badge [variant]="p.status === 'active' ? 'success' : p.status === 'completed' ? 'primary' : 'default'">{{ p.status }}</app-badge>
                </a>
              }
            </div>
          }
        </div>

        <!-- Recent Time Entries -->
        <div class="bg-surface rounded-xl border border-border p-6">
          <h2 class="text-lg font-semibold text-text-primary mb-4">Recent Time Entries</h2>
          @if (entries().length === 0) {
            <p class="text-sm text-text-secondary py-4 text-center">No time entries for this client</p>
          } @else {
            <div class="space-y-2">
              @for (e of entries().slice(0, 10); track e.id) {
                <div class="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p class="text-sm font-medium text-text-primary">{{ e.description || e.projectName }}</p>
                    <p class="text-xs text-text-tertiary">{{ formatDate(e.startTime) }}</p>
                  </div>
                  <span class="text-sm font-mono font-medium text-text-primary">{{ formatDuration(e.duration) }}</span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ClientDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly clientService = inject(ClientService);
  private readonly projectService = inject(ProjectService);
  private readonly timeEntryService = inject(TimeEntryService);

  readonly client = signal<any>(null);
  readonly projects = signal<any[]>([]);
  readonly entries = signal<any[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    const c = await this.clientService.getById(id);
    if (c) {
      this.client.set(c);
      const projects = await this.projectService.getByClientId(id);
      this.projects.set(projects);
      await this.timeEntryService.loadAll({ clientId: id });
      this.entries.set(this.timeEntryService.entries());
    } else {
      this.error.set('Client not found');
    }
    this.loading.set(false);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
}
