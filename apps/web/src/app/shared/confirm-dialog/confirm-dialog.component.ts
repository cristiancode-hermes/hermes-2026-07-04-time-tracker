import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="onCancel.emit()"></div>
        <div class="relative w-full max-w-md bg-surface rounded-2xl shadow-modal border border-border p-6">
          @if (icon()) {
            <div class="w-12 h-12 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center mb-4 mx-auto">
              <svg class="w-6 h-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          }
          <h3 class="text-lg font-semibold text-center text-text-primary mb-2">{{ title() }}</h3>
          @if (message()) {
            <p class="text-sm text-text-secondary text-center mb-6">{{ message() }}</p>
          }
          <div class="flex gap-3 justify-center">
            <button
              (click)="onCancel.emit()"
              class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-primary hover:bg-surface-tertiary transition-colors"
            >
              {{ cancelText() }}
            </button>
            <button
              (click)="onConfirm.emit()"
              class="px-4 py-2 text-sm font-medium rounded-lg bg-danger-500 text-white hover:bg-danger-600 transition-colors"
            >
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly isOpen = input(false);
  readonly title = input('Confirm');
  readonly message = input('');
  readonly icon = input(true);
  readonly confirmText = input('Delete');
  readonly cancelText = input('Cancel');
  readonly onConfirm = output<void>();
  readonly onCancel = output<void>();
}
