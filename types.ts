
export interface Block {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

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
  blockId?: string;
  blockName?: string;
  blockColor?: string;
}

export type TimerStatus = 'idle' | 'running' | 'paused';

