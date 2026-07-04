import { Component, input, model, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-select',
  standalone: true,
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label class="text-sm font-medium text-text-primary">{{ label() }}</label>
      }
      <select
        [value]="value()"
        (change)="onSelect($event)"
        (blur)="onTouched()"
        [disabled]="disabled()"
        class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        [class.border-danger-500]="!!error()"
      >
        @if (placeholder()) {
          <option value="" disabled selected>{{ placeholder() }}</option>
        }
        @for (opt of options(); track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>
      @if (error()) {
        <p class="text-xs text-danger-500">{{ error() }}</p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly error = input<string>('');
  readonly disabled = input(false);
  readonly options = input<{ value: string; label: string }[]>([]);
  readonly value = model<string>('');

  onChange: any = () => {};
  onTouched: any = () => {};

  onSelect(event: Event): void {
    const el = event.target as HTMLSelectElement;
    this.value.set(el.value);
    this.onChange(el.value);
  }

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {}
}
