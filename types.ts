
export type PomodoroProfile = '25-5' | '50-10' | '90-10' | 'no-timer';

export interface TimeBlock {
  startTime: string;
  endTime: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  isHabit?: boolean;
  startTime?: string;
  endTime?: string;
  timeBlocks?: TimeBlock[];
  isCompletedToday?: boolean; // UI-only field to track daily completion
  progress?: number; // Calculated field for UI
}

export type RecurrenceType = 'none' | 'daily' | 'weekly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  timeSpent: number; // in seconds
  pomodoroProfile: PomodoroProfile;
  pomodorosRequired: number;
  pomodorosCompleted: number;
  folderId?: string;
  recurrenceType: RecurrenceType;
  recurrenceDays?: number[]; // 0-6 for Sun-Sat
}

export type TimerStatus = 'idle' | 'running' | 'paused';

