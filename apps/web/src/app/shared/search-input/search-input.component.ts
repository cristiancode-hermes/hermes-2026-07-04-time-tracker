import { Component, input, output, model } from '@angular/core';

@Component({
  selector: 'app-search-input',
  standalone: true,
  template: `
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        [value]="value()"
        (input)="onInput($event)"
        [placeholder]="placeholder()"
        class="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      />
      @if (value()) {
        <button
          (click)="onClear()"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      }
    </div>
  `,
})
export class SearchInputComponent {
  readonly placeholder = input('Search...');
  readonly value = model<string>('');
  readonly onSearch = output<string>();

  onInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.value.set(el.value);
    this.onSearch.emit(el.value);
  }

  onClear(): void {
    this.value.set('');
    this.onSearch.emit('');
  }
}
