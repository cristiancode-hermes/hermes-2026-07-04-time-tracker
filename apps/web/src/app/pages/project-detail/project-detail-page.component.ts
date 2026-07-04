import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TimeEntryService } from '../../services/time-entry.service';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-project-detail-page',
  standalone: true,
  imports: [RouterLink, BadgeComponent],
  template: `
    <div class="space-y-6">
      <a routerLink="/projects" class="text-sm text-primary-500 hover:text-primary-600">&larr; Back to Projects</a>
      @if (project(); as p) {
        <div class="bg-surface rounded-xl border border-border p-6">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-2xl font-bold text-text-primary">{{ p.name }}</h1>
              <p class="text-sm text-text-secondary mt-1">Client: {{ p.clientName || 'N/A' }} &middot; \${{ p.hourlyRate }}/hr</p>
              <p class="text-sm text-text-secondary mt-1">Total: <span class="font-mono">{{ p.totalHours || 0 }}h</span> &middot; <span class="font-mono text-accent-600">\${{ ((p.totalHours || 0) * p.hourlyRate).toFixed(2) }}</span></p>
            </div>
            <app-badge [variant]="p.status === 'active' ? 'primary' : 'success'">{{ p.status }}</app-badge>
          </div>
        </div>
        <div class="bg-surface rounded-xl border border-border">
          <div class="px-6 py-4 border-b border-border"><h2 class="font-semibold text-text-primary">Time Entries</h2></div>
          <div class="p-6">
            @if (projectEntries().length === 0) {
              <p class="text-sm text-text-secondary text-center py-8">No time entries for this project yet.</p>
            } @else {
              <table class="w-full">
                <thead><tr class="border-b border-border">
                  <th class="text-left pb-3 text-xs font-medium text-text-tertiary uppercase">Date</th>
                  <th class="text-left pb-3 text-xs font-medium text-text-tertiary uppercase">Description</th>
                  <th class="text-right pb-3 text-xs font-medium text-text-tertiary uppercase">Duration</th>
                </tr></thead>
                <tbody>
                  @for (e of projectEntries(); track e.id) {
                    <tr class="border-b border-border-light">
                      <td class="py-2 text-sm font-mono text-text-primary">{{ e.startTime?.substring(0, 10) || e.startTime }}</td>
                      <td class="py-2 text-sm text-text-secondary">{{ e.description || '-' }}</td>
                      <td class="py-2 text-sm text-right font-mono text-text-primary">{{ e.duration.toFixed(1) }}h</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      } @else {
        <div class="bg-surface rounded-xl border border-border p-12 text-center"><p class="text-text-secondary">Loading project...</p></div>
      }
    </div>
  `
})
export class ProjectDetailPageComponent {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private timeEntryService = inject(TimeEntryService);
  readonly project = signal<any>(null);
  readonly projectEntries = computed(() => {
    const p = this.project();
    if (!p) return [];
    return this.timeEntryService.entries().filter(e => e.projectId === p.id);
  });
  constructor() { this.load(); }
  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await Promise.all([this.projectService.loadAll(), this.timeEntryService.loadAll()]);
      this.project.set(this.projectService.projects().find(p => p.id === id));
    }
  }
}
