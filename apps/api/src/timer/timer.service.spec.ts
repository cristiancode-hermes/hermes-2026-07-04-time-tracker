import { Test, TestingModule } from '@nestjs/testing';
import { TimerService } from './timer.service';

describe('TimerService', () => {
  let service: TimerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimerService],
    }).compile();

    service = module.get<TimerService>(TimerService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('start', () => {
    it('should start a timer and return its active state', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-04T10:00:00Z'));

      const result = service.start('user-1', 'proj-1', 'Working on feature X');

      expect(result).not.toBeNull();
      expect(result!.projectId).toBe('proj-1');
      expect(result!.description).toBe('Working on feature X');
      expect(result!.startedAt).toBeInstanceOf(Date);
      expect(result!.elapsedHours).toBe(0);
    });

    it('should overwrite existing timer if already running', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-04T10:00:00Z'));

      service.start('user-1', 'proj-1', 'First task');
      jest.setSystemTime(new Date('2026-07-04T12:00:00Z'));
      const result = service.start('user-1', 'proj-2', 'Second task');

      expect(result!.projectId).toBe('proj-2');
      expect(result!.description).toBe('Second task');
      // Only ~0h elapsed since last start
      expect(result!.elapsedHours).toBeLessThan(0.01);
    });

    it('should allow concurrent timers for different users', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-04T10:00:00Z'));

      service.start('user-1', 'proj-1', 'User 1 task');
      service.start('user-2', 'proj-2', 'User 2 task');

      const user1Timer = service.getActive('user-1');
      const user2Timer = service.getActive('user-2');

      expect(user1Timer!.projectId).toBe('proj-1');
      expect(user2Timer!.projectId).toBe('proj-2');
    });

    it('should accept start without description', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-04T10:00:00Z'));

      const result = service.start('user-1', 'proj-1');

      expect(result!.description).toBeNull();
    });
  });

  describe('stop', () => {
    it('should stop a running timer and return duration', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-04T10:00:00Z'));

      service.start('user-1', 'proj-1', 'Some task');
      jest.setSystemTime(new Date('2026-07-04T12:30:00Z')); // 2.5 hours later

      const result = service.stop('user-1');

      expect(result).not.toBeNull();
      expect(result!.projectId).toBe('proj-1');
      expect(result!.description).toBe('Some task');
      expect(result!.durationHours).toBeCloseTo(2.5, 1);
      expect(result!.startedAt).toBeInstanceOf(Date);
      expect(result!.stoppedAt).toBeInstanceOf(Date);
    });

    it('should return null if no timer is running', () => {
      const result = service.stop('user-1');
      expect(result).toBeNull();
    });

    it('should clear timer after stopping', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-04T10:00:00Z'));

      service.start('user-1', 'proj-1', 'Task');
      service.stop('user-1');

      const active = service.getActive('user-1');
      expect(active).toBeNull();
    });
  });

  describe('getActive', () => {
    it('should return active timer state with elapsed hours', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-04T10:00:00Z'));

      service.start('user-1', 'proj-1', 'Current task');
      jest.setSystemTime(new Date('2026-07-04T11:00:00Z')); // 1 hour later

      const result = service.getActive('user-1');

      expect(result).not.toBeNull();
      expect(result!.projectId).toBe('proj-1');
      expect(result!.elapsedHours).toBeCloseTo(1.0, 1);
    });

    it('should return null if no timer is running', () => {
      const result = service.getActive('user-1');
      expect(result).toBeNull();
    });
  });
});
