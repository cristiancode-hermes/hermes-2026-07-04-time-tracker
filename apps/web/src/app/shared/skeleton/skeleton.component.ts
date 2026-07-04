import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="animate-pulse" [class]="containerClass()">
      @if (type() === 'text') {
        <div class="h-4 bg-surface-tertiary rounded w-full"></div>
      } @else if (type() === 'title') {
        <div class="h-6 bg-surface-tertiary rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-surface-tertiary rounded w-1/2"></div>
      } @else if (type() === 'card') {
        <div class="bg-surface rounded-xl border border-border p-6">
          <div class="h-4 bg-surface-tertiary rounded w-1/3 mb-4"></div>
          <div class="h-8 bg-surface-tertiary rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-surface-tertiary rounded w-2/3"></div>
        </div>
      } @else if (type() === 'table-row') {
        <div class="flex gap-4 py-3 border-b border-border">
          @for (col of columns(); track col) {
            <div class="h-4 bg-surface-tertiary rounded" [style.width.%]="col"></div>
          }
        </div>
      } @else {
        <div class="h-4 bg-surface-tertiary rounded w-full"></div>
      }
    </div>
  `,
})
export class SkeletonComponent {
  readonly type = input<'text' | 'title' | 'card' | 'table-row'>('text');
  readonly columns = input<number[]>([25, 25, 25, 25]);
  readonly count = input(1);
  readonly containerClass = computed(() => this.count() > 1 ? 'space-y-3' : '');
}
