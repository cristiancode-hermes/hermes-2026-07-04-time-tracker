import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private add(type: ToastType, message: string, duration: number = 4000): void {
    const id = crypto.randomUUID();
    const toast: Toast = { id, type, message, duration };
    this.toasts.update(list => [...list, toast]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  success(message: string): void {
    this.add('success', message);
  }

  error(message: string): void {
    this.add('error', message, 6000);
  }

  info(message: string): void {
    this.add('info', message);
  }

  warning(message: string): void {
    this.add('warning', message, 5000);
  }
}
