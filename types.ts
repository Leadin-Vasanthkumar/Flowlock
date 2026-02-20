
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  timeSpent: number; // in seconds
  estimatedSeconds: number; // countdown duration
  location?: string;
  purpose?: string;
}

export type TimerStatus = 'idle' | 'running' | 'paused';
