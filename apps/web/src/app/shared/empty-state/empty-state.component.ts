import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      @if (icon()) {
        <div class="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
          <span class="text-3xl">{{ icon() }}</span>
        </div>
      }
      <h3 class="text-lg font-semibold text-text-primary mb-1">{{ title() }}</h3>
      @if (message()) {
        <p class="text-sm text-text-secondary max-w-sm">{{ message() }}</p>
      }
      @if (action()) {
        <div class="mt-4">
          <ng-content />
        </div>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input<string>('');
  readonly title = input<string>('No data');
  readonly message = input<string>('');
  readonly action = input<string>('');
}
