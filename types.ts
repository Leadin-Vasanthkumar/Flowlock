
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  timeSpent: number; // in seconds
}

export type TimerStatus = 'idle' | 'running' | 'paused';
export type TimerMode = 'flow' | 'pomodoro';
export type PomodoroState = 'work' | 'break';
