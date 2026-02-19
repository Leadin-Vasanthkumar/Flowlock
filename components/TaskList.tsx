
import React, { useState } from 'react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  showAddInput?: boolean;
  limit?: number;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onSelectTask,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  showAddInput = true,
  limit
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      await onAddTask(newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const displayedTasks = limit ? pendingTasks.slice(0, limit) : pendingTasks;

  return (
    <div className="w-full z-20 flex flex-col justify-end">
      {/* Task list appears ABOVE the input */}
      <div className="mb-3 space-y-1 max-h-48 overflow-y-auto scrollbar-hide flex flex-col justify-end">
        {displayedTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`group cursor-pointer transition-all duration-300 px-4 py-2 rounded-lg flex items-center justify-between border ${activeTaskId === task.id
              ? 'bg-purple-500/10 border-purple-500/30'
              : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {activeTaskId === task.id && (
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
              <span className={`text-sm truncate transition-colors ${activeTaskId === task.id ? 'text-purple-300 font-semibold' : 'text-white/40 group-hover:text-white/70'
                }`}>
                {task.title}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(task.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 text-white/20 hover:text-red-400"
              title="Delete task"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Input Field (The "Next Flow" button/box) */}
      {showAddInput && (
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What's your next flow?"
            className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
};

export default TaskList;
