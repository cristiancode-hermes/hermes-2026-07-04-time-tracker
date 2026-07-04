import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          (click)="closeOnBackdrop() && onClose.emit()"
        ></div>
        <!-- Modal -->
        <div
          class="relative w-full bg-surface rounded-2xl shadow-modal border border-border"
          [class]="sizeClasses()"
        >
          @if (title()) {
            <div class="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 class="text-lg font-semibold text-text-primary">{{ title() }}</h3>
              <button
                (click)="onClose.emit()"
                class="text-text-tertiary hover:text-text-primary transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }
          <div class="px-6 py-4">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly isOpen = input(false);
  readonly title = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly closeOnBackdrop = input(true);
  readonly onClose = output<void>();

  protected readonly sizeClasses = computed(() => {
    const sizes: Record<string, string> = {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    };
    return sizes[this.size()];
  });
}
