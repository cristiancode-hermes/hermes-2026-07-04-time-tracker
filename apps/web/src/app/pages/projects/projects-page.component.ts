import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/error-state/error-state.component';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [RouterLink, FormsModule, SpinnerComponent, EmptyStateComponent, ErrorStateComponent, SearchInputComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Projects</h1>
          <p class="text-sm text-text-secondary mt-1">Manage your projects</p>
        </div>
        <button (click)="showForm.set(true)" class="px-4 py-2 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors">+ New Project</button>
      </div>
      <app-search-input placeholder="Search projects..." [value]="searchQuery()" (onSearch)="searchQuery.set($event)" />
      @if (projectService.loading()) { <app-spinner label="Loading projects..." /> }
      @else if (projectService.error()) { <app-error-state [message]="projectService.error()!" (onRetry)="load()" /> }
      @else if (filteredProjects().length === 0) { <app-empty-state icon="📁" title="No projects yet" message="Create your first project to start tracking time." /> }
      @else {
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          @for (project of filteredProjects(); track project.id) {
            <div class="bg-surface rounded-xl border border-border p-5 shadow-card hover:shadow-md transition-shadow cursor-pointer" [routerLink]="['/projects', project.id]">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold text-text-primary">{{ project.name }}</h3>
                <app-badge [variant]="project.status === 'active' ? 'primary' : project.status === 'completed' ? 'success' : 'warning'">{{ project.status }}</app-badge>
              </div>
              <p class="text-sm text-text-secondary mb-3">{{ project.clientName || 'No client' }}</p>
              <div class="flex items-center justify-between text-sm">
                <span class="text-text-tertiary">\${{ project.hourlyRate }}/hr</span>
                <span class="font-mono text-text-primary">{{ project.totalHours || 0 }}h</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ProjectsPageComponent {
  readonly projectService = inject(ProjectService);
  readonly router = inject(Router);
  readonly searchQuery = signal('');
  readonly showForm = signal(false);
  readonly editingProject = signal<any>(null);
  readonly form = { name: signal('') };

  readonly filteredProjects = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.projectService.projects();
    return this.projectService.projects().filter(p => p.name.toLowerCase().includes(q) || (p.clientName || '').toLowerCase().includes(q));
  });

  constructor() { this.projectService.loadAll(); }
  load(): void { this.projectService.loadAll(); }

  async saveProject(): Promise<void> {
    await this.projectService.create({ name: this.form.name() });
    this.showForm.set(false);
    this.form.name.set('');
  }
}
