import { Injectable } from '@nestjs/common';

interface ActiveTimer {
  projectId: string;
  description: string | null;
  startedAt: Date;
}

@Injectable()
export class TimerService {
  private readonly timers = new Map<string, ActiveTimer>();

  start(userId: string, projectId: string, description?: string) {
    this.timers.set(userId, {
      projectId,
      description: description ?? null,
      startedAt: new Date(),
    });
    return this.getActive(userId);
  }

  stop(userId: string) {
    const timer = this.timers.get(userId);
    if (!timer) return null;

    const now = new Date();
    const durationMs = now.getTime() - timer.startedAt.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    this.timers.delete(userId);

    return {
      projectId: timer.projectId,
      description: timer.description,
      startedAt: timer.startedAt,
      stoppedAt: now,
      durationHours: Math.round(durationHours * 100) / 100,
    };
  }

  getActive(userId: string) {
    const timer = this.timers.get(userId);
    if (!timer) return null;

    const elapsedMs = new Date().getTime() - timer.startedAt.getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    return {
      projectId: timer.projectId,
      description: timer.description,
      startedAt: timer.startedAt,
      elapsedHours: Math.round(elapsedHours * 100) / 100,
    };
  }
}
