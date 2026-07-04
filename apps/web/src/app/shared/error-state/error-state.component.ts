import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="w-16 h-16 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-text-primary mb-1">Something went wrong</h3>
      @if (message()) {
        <p class="text-sm text-text-secondary max-w-sm mb-4">{{ message() }}</p>
      }
      <button
        (click)="onRetry.emit()"
        class="px-4 py-2 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
      >
        Try again
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly message = input<string>('An unexpected error occurred');
  readonly onRetry = output<void>();
}
