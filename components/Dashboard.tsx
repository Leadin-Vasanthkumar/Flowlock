
import React, { useState, useEffect, useRef } from 'react';
import TimerView from './TimerView';
import TodoView from './TodoView';
import { Task, TimerStatus, TimerMode, PomodoroState } from '../types';
import { supabase } from '../lib/supabase';

const POMODORO_WORK_SECONDS = 25 * 60;
const POMODORO_BREAK_SECONDS = 5 * 60;

type ViewType = 'timer' | 'todo';

const Dashboard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
    const [timerMode, setTimerMode] = useState<TimerMode>('flow');
    const [pomodoroState, setPomodoroState] = useState<PomodoroState>('work');
    const [seconds, setSeconds] = useState(0);
    const [currentView, setCurrentView] = useState<ViewType>('timer');
    const [loading, setLoading] = useState(true);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioCtx = useRef<AudioContext | null>(null);

    // Fetch initial data
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .eq('user_id', user.id)
                .order('inserted_at', { ascending: true });

            if (error) throw error;

            if (data) {
                const mappedTasks: Task[] = data.map(t => ({
                    id: t.id,
                    title: t.task,
                    completed: t.is_completed,
                    timeSpent: t.time_spent || 0
                }));
                setTasks(mappedTasks);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (title: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('todos')
                .insert({ user_id: user.id, task: title })
                .select()
                .single();

            if (error) throw error;
            return data ? { id: data.id, title: data.task, completed: data.is_completed, timeSpent: 0 } : null;
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task. Please try again.'); // Minimal feedback
            return null;
        }
    };

    const updateTaskStatus = async (id: string, is_completed: boolean, time_spent?: number) => {
        try {
            const updates: any = { is_completed };
            if (time_spent !== undefined) updates.time_spent = time_spent;

            const { error } = await supabase
                .from('todos')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const logFocusSession = async (durationSeconds: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const durationMinutes = Math.floor(durationSeconds / 60);
            if (durationMinutes < 1) return; // Don't log sessions shorter than 1 minute

            const { error } = await supabase
                .from('focus_sessions')
                .insert({
                    user_id: user.id,
                    duration_minutes: durationMinutes,
                    status: 'completed',
                    end_time: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error logging focus session:', error);
        }
    };

    const removeTask = async (id: string) => {
        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }


    // Simple "Ting Dong" sound using Oscillator
    const playNotification = () => {
        if (!audioCtx.current) {
            audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtx.current;

        const playTone = (freq: number, start: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.1, start);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + duration);
        };

        const now = ctx.currentTime;
        playTone(880, now, 0.5); // Ting
        playTone(660, now + 0.25, 0.5); // Dong
    };

    const handleToggleTimer = () => {
        if (!activeTaskId && timerMode === 'flow') return;
        if (timerStatus === 'running') {
            setTimerStatus('paused');
        } else {
            setTimerStatus('running');
        }
    };

    const handleMarkDone = async () => {
        if (activeTaskId) {
            const task = tasks.find(t => t.id === activeTaskId);
            const additionalTime = timerMode === 'flow' ? seconds : 0; // Pomodoro usually has fixed time, but we'll stick to flow for now or handle both
            const newTotalTime = (task?.timeSpent || 0) + additionalTime;

            // Optimistic update
            setTasks(prev => prev.map(t =>
                t.id === activeTaskId
                    ? { ...t, completed: true, timeSpent: newTotalTime }
                    : t
            ));

            await updateTaskStatus(activeTaskId, true, newTotalTime);
            await logFocusSession(additionalTime);

            setTimerStatus('idle');
            setSeconds(timerMode === 'pomodoro' ? POMODORO_WORK_SECONDS : 0);
            setActiveTaskId(null);
        }
    };

    const handleAddTask = async (title: string) => {
        // Optimistic update? Or wait for DB? Let's wait for DB for ID.
        const newTask = await createTask(title);
        if (!newTask) return;

        setTasks(prev => [...prev, newTask]);
        if (!activeTaskId) {
            setActiveTaskId(newTask.id);
            if (timerMode === 'pomodoro') {
                setSeconds(POMODORO_WORK_SECONDS);
                setPomodoroState('work');
            } else {
                setSeconds(0);
            }
            setTimerStatus('running');
        }
    };

    const handleDeleteTask = async (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        await removeTask(id);

        if (activeTaskId === id) {
            setTimerStatus('idle');
            setSeconds(timerMode === 'pomodoro' ? POMODORO_WORK_SECONDS : 0);
            setActiveTaskId(null);
        }
    };

    const handleModeChange = (mode: TimerMode) => {
        setTimerMode(mode);
        setTimerStatus('idle');
        setPomodoroState('work');
        setSeconds(mode === 'pomodoro' ? POMODORO_WORK_SECONDS : 0);
    };

    const handleSelectTask = (id: string) => {
        if (activeTaskId !== id) {
            setActiveTaskId(id);
            if (timerMode === 'pomodoro') {
                setSeconds(POMODORO_WORK_SECONDS);
                setPomodoroState('work');
            } else {
                setSeconds(0);
            }
            setTimerStatus('running');
        }
    };

    const handleToggleComplete = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        await updateTaskStatus(id, !task.completed);

        if (activeTaskId === id) {
            setTimerStatus('idle');
            setSeconds(timerMode === 'pomodoro' ? POMODORO_WORK_SECONDS : 0);
            setActiveTaskId(null);
        }
    };

    const handleReset = () => {
        setTimerStatus('idle');
        if (timerMode === 'flow') {
            setSeconds(0);
        } else {
            setSeconds(pomodoroState === 'work' ? POMODORO_WORK_SECONDS : POMODORO_BREAK_SECONDS);
        }
    };

    useEffect(() => {
        if (timerStatus === 'running') {
            timerRef.current = setInterval(() => {
                setSeconds(s => {
                    if (timerMode === 'flow') return s + 1;

                    if (s <= 1) {
                        // Transition Pomodoro State
                        playNotification();
                        if (pomodoroState === 'work') {
                            setPomodoroState('break');
                            return POMODORO_BREAK_SECONDS;
                        } else {
                            setPomodoroState('work');
                            return POMODORO_WORK_SECONDS;
                        }
                    }
                    return s - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timerStatus, timerMode, pomodoroState]);

    return (
        <div className="relative h-screen w-full bg-[#0d071a] text-white overflow-hidden select-none">

            {/* Sign Out Button */}
            <div className="absolute top-4 right-4 z-50">
                <button
                    onClick={() => supabase.auth.signOut()}
                    className="text-white/40 hover:text-white transition-colors text-sm"
                >
                    Sign Out
                </button>
            </div>

            {/* View Rendering */}
            {currentView === 'timer' ? (
                <TimerView
                    timerMode={timerMode}
                    timerStatus={timerStatus}
                    pomodoroState={pomodoroState}
                    seconds={seconds}
                    activeTaskId={activeTaskId}
                    tasks={tasks}
                    onToggleTimer={handleToggleTimer}
                    onMarkDone={handleMarkDone}
                    onSelectTask={handleSelectTask}
                    onAddTask={handleAddTask}
                    onDeleteTask={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                    onModeChange={handleModeChange}
                    onReset={handleReset}
                />
            ) : (
                <TodoView
                    tasks={tasks}
                    activeTaskId={activeTaskId}
                    onSelectTask={handleSelectTask}
                    onAddTask={handleAddTask}
                    onDeleteTask={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                />
            )}

            {/* Navigation Button - Bottom Right */}
            <div className="absolute bottom-12 right-12 z-50">
                <button
                    onClick={() => setCurrentView(prev => prev === 'timer' ? 'todo' : 'timer')}
                    className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-300"
                    title={currentView === 'timer' ? "View To-Do List" : "Back to Timer"}
                >
                    {currentView === 'timer' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/60 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/60 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </button>
            </div>

        </div>
    );
};

export default Dashboard;
