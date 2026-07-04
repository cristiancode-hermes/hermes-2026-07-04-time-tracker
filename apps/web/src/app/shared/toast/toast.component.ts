import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 px-4 py-3 rounded-xl shadow-dropdown border animate-slide-in"
          [class]="bgClass(toast.type)"
        >
          <span class="text-lg">{{ icon(toast.type) }}</span>
          <p class="text-sm font-medium flex-1" [class]="textClass(toast.type)">{{ toast.message }}</p>
          <button
            (click)="toastService.dismiss(toast.id)"
            class="text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in { animation: slide-in 0.3s ease-out; }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  protected icon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '';
    }
  }

  protected bgClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-success-50 border-success-200 dark:bg-success-950 dark:border-success-800';
      case 'error': return 'bg-danger-50 border-danger-200 dark:bg-danger-950 dark:border-danger-800';
      case 'warning': return 'bg-warning-50 border-warning-200 dark:bg-warning-950 dark:border-warning-800';
      case 'info': return 'bg-secondary-50 border-secondary-200 dark:bg-secondary-950 dark:border-secondary-800';
      default: return 'bg-surface border-border';
    }
  }

  protected textClass(type: string): string {
    switch (type) {
      case 'success': return 'text-success-700 dark:text-success-300';
      case 'error': return 'text-danger-700 dark:text-danger-300';
      case 'warning': return 'text-warning-700 dark:text-warning-300';
      case 'info': return 'text-secondary-700 dark:text-secondary-300';
      default: return 'text-text-primary';
    }
  }
}
