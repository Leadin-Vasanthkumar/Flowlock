
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  timeSpent: number; // in seconds
  estimatedSeconds: number; // countdown duration
  location?: string;
  purpose?: string;
  scheduledAt?: string; // ISO timestamp for when to start this task
  habitId?: string;
}

export type TimerStatus = 'idle' | 'running' | 'paused';

