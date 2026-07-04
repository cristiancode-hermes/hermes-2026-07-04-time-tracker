import { Component, input, computed } from '@angular/core';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full"
      [class]="variantClasses()"
    >
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly variant = input<string>('default');

  protected readonly variantClasses = computed(() => {
    const variants: Record<string, string> = {
      default: 'bg-surface-tertiary text-text-secondary',
      primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
      success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
      warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
      danger: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300',
      info: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300',
    };
    return variants[this.variant()];
  });
}
