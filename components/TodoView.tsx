import React from 'react';
import TaskList from './TaskList';
import { Task } from '../types';

interface TodoViewProps {
    tasks: Task[];
    activeTaskId: string | null;
    onSelectTask: (id: string) => void;
    onAddTask: (title: string) => void;
    onDeleteTask: (id: string) => void;
    onToggleComplete: (id: string) => void;
}

const TodoView: React.FC<TodoViewProps> = ({
    tasks,
    activeTaskId,
    onSelectTask,
    onAddTask,
    onDeleteTask,
    onToggleComplete
}) => {
    return (
        <div className="relative h-full w-full flex flex-col items-center pt-24 px-12 pb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white/90 mb-8 self-start">Tasks</h2>

            <div className="w-full max-w-3xl flex-1 overflow-visible">
                <TaskList
                    tasks={tasks}
                    activeTaskId={activeTaskId}
                    onSelectTask={onSelectTask}
                    onAddTask={onAddTask}
                    onDeleteTask={onDeleteTask}
                    onToggleComplete={onToggleComplete}
                    showAddInput={true}
                // No limit here, show all tasks
                />
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-white/5 uppercase tracking-[0.8em] pointer-events-none">
                TASK MANAGEMENT
            </div>
        </div>
    );
};

export default TodoView;
