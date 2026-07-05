import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty toasts list', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('should add a success toast', () => {
    service.success('Operation completed');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Operation completed');
  });

  it('should add an error toast', () => {
    service.error('Something went wrong');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('error');
    expect(toasts[0].message).toBe('Something went wrong');
  });

  it('should add an info toast', () => {
    service.info('For your information');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('info');
    expect(toasts[0].message).toBe('For your information');
  });

  it('should add a warning toast', () => {
    service.warning('Proceed with caution');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('warning');
    expect(toasts[0].message).toBe('Proceed with caution');
  });

  it('should dismiss a toast by id', () => {
    service.success('First');
    service.error('Second');
    expect(service.toasts().length).toBe(2);

    const firstToast = service.toasts()[0];
    service.dismiss(firstToast.id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].id).not.toBe(firstToast.id);
  });

  it('should use default duration of 4000 for success', () => {
    vi.useFakeTimers();
    service.success('Timed');
    const toast = service.toasts()[0];
    expect(toast.duration).toBe(4000);

    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });

  it('should use extended duration of 6000 for error', () => {
    vi.useFakeTimers();
    service.error('Fatal');
    const toast = service.toasts()[0];
    expect(toast.duration).toBe(6000);

    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(2000);
    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });

  it('should use duration of 5000 for warning', () => {
    vi.useFakeTimers();
    service.warning('Heads up');
    const toast = service.toasts()[0];
    expect(toast.duration).toBe(5000);

    vi.advanceTimersByTime(5000);
    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });

  it('should generate a unique id for each toast', () => {
    service.success('A');
    service.success('B');
    expect(service.toasts()[0].id).not.toBe(service.toasts()[1].id);
  });

  it('should handle dismissal of non-existent id gracefully', () => {
    service.success('Test');
    const originalLength = service.toasts().length;
    service.dismiss('non-existent-id');
    expect(service.toasts().length).toBe(originalLength);
  });
});
