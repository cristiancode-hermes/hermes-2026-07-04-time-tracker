import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TimerService } from '../../services/timer.service';
import { ThemeService } from '../../services/theme.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      <!-- Breadcrumb area -->
      <div class="flex items-center gap-2 text-sm">
        <span class="text-text-tertiary">Pages</span>
        @if (currentPath()) {
          <span class="text-text-tertiary">/</span>
          <span class="text-text-primary font-medium">{{ currentPath() }}</span>
        }
      </div>

      <!-- Right actions -->
      <div class="flex items-center gap-3">
        <!-- Global Timer Indicator -->
        @if (timerService.isRunning()) {
          <div class="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
              <span class="text-sm font-mono font-medium text-accent-700 dark:text-accent-300">
                {{ timerService.elapsedFormatted }}
              </span>
            </div>
            <span class="text-xs text-accent-600 dark:text-accent-400 max-w-[120px] truncate">
              {{ timerService.activeTimer()?.projectName }}
            </span>
            <button
              (click)="stopTimer()"
              class="p-1 rounded hover:bg-accent-100 dark:hover:bg-accent-800 transition-colors"
              title="Stop timer"
            >
              <svg class="w-4 h-4 text-accent-600 dark:text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                <rect x="4" y="4" width="12" height="12" rx="2" />
              </svg>
            </button>
          </div>
        }

        <!-- Start Timer Button -->
        <button
          (click)="showTimerModal.set(true)"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Start Timer
        </button>

        <!-- Theme Toggle -->
        <button
          (click)="themeService.toggle()"
          class="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-all"
          [title]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          @if (themeService.isDark()) {
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          } @else {
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          }
        </button>

        <!-- User Menu -->
        @if (authService.user(); as user) {
          <div class="relative">
            <button
              (click)="showUserMenu.set(!showUserMenu())"
              class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              <div class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span class="text-xs font-medium text-primary-600 dark:text-primary-400">{{ user.name?.charAt(0) || 'U' }}</span>
              </div>
            </button>

            @if (showUserMenu()) {
              <div class="absolute right-0 top-full mt-1 w-48 bg-surface rounded-xl shadow-dropdown border border-border py-1 z-50">
                <button
                  (click)="authService.logout()"
                  class="w-full px-4 py-2 text-sm text-left text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-colors"
                >
                  Sign out
                </button>
              </div>
            }
          </div>
        }
      </div>
    </header>

    <!-- Timer Start Modal -->
    @if (showTimerModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="showTimerModal.set(false)"></div>
        <div class="relative w-full max-w-md bg-surface rounded-2xl shadow-modal border border-border p-6">
          <h3 class="text-lg font-semibold text-text-primary mb-4">Start Timer</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">Project</label>
              <select
                [(ngModel)]="selectedProjectId"
                class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a project...</option>
                @for (project of projects(); track project.id) {
                  <option [value]="project.id">{{ project.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">Description (optional)</label>
              <input
                [(ngModel)]="timerDescription"
                class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="What are you working on?"
              />
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <button
                (click)="showTimerModal.set(false)"
                class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-primary hover:bg-surface-tertiary"
              >
                Cancel
              </button>
              <button
                (click)="startTimer()"
                [disabled]="!selectedProjectId()"
                class="px-4 py-2 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly timerService = inject(TimerService);
  readonly themeService = inject(ThemeService);
  readonly projectService = inject(ProjectService);
  readonly router = inject(Router);

  readonly showUserMenu = signal(false);
  readonly showTimerModal = signal(false);
  readonly selectedProjectId = signal('');
  readonly timerDescription = signal('');
  readonly projects = signal<any[]>([]);

  readonly currentPath = computed(() => {
    const url = this.router.url;
    const parts = url.split('/').filter(Boolean);
    return parts.length > 0 ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : '';
  });

  constructor() {
    this.loadProjects();
  }

  async loadProjects(): Promise<void> {
    await this.projectService.loadAll();
    this.projects.set(this.projectService.projects().filter(p => p.status === 'active'));
  }

  startTimer(): void {
    const projectId = this.selectedProjectId();
    if (!projectId) return;
    const project = this.projects().find(p => p.id === projectId);
    this.timerService.startTimer(projectId, project?.name || '', this.timerDescription());
    this.showTimerModal.set(false);
    this.selectedProjectId.set('');
    this.timerDescription.set('');
  }

  async stopTimer(): Promise<void> {
    await this.timerService.stopTimer();
  }
}
