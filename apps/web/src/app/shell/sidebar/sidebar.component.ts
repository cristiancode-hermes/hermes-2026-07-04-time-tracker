import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-surface border-r border-border flex flex-col h-full">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-border">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <span class="text-white font-bold text-sm">HT</span>
          </div>
          <span class="font-semibold text-text-primary">Time Tracker</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
            [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
            class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-all"
          >
            <span class="text-lg">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- User section -->
      @if (authService.user(); as user) {
        <div class="p-4 border-t border-border">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span class="text-sm font-medium text-primary-600 dark:text-primary-400">
                {{ user.name?.charAt(0) || 'U' }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-primary truncate">{{ user.name || user.email }}</p>
              <p class="text-xs text-text-tertiary truncate">{{ user.email }}</p>
            </div>
          </div>
        </div>
      }
    </aside>
  `,
})
export class SidebarComponent {
  readonly authService = inject(AuthService);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Clients', path: '/clients', icon: '👥' },
    { label: 'Projects', path: '/projects', icon: '📁' },
    { label: 'Time Entries', path: '/time-entries', icon: '⏱' },
    { label: 'Invoices', path: '/invoices', icon: '📄' },
    { label: 'Reports', path: '/reports', icon: '📈' },
  ];
}
