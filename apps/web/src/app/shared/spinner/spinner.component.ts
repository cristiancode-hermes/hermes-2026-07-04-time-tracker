import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center" [class]="containerClass()">
      <svg
        class="animate-spin"
        [class]="sizeClass()"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      @if (label()) {
        <span class="ml-2 text-sm text-text-secondary">{{ label() }}</span>
      }
    </div>
  `,
})
export class SpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly label = input<string>('');
  readonly fullScreen = input(false);

  protected readonly containerClass = computed(() =>
    this.fullScreen() ? 'min-h-[60vh]' : ''
  );

  protected readonly sizeClass = computed(() => {
    const sizes: Record<string, string> = {
      sm: 'w-4 h-4 text-primary-500',
      md: 'w-8 h-8 text-primary-500',
      lg: 'w-12 h-12 text-primary-500',
    };
    return sizes[this.size()];
  });
}
