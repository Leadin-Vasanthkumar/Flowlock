import React, { useState, useEffect, useRef } from 'react';
import TaskDashboard from './TaskDashboard';
import TimerView from './TimerView';
import UserProfileMenu from './UserProfileMenu';
import { GoalData } from './GoalsPanel';
import { Task, TimerStatus } from '../types';
import { supabase } from '../lib/supabase';

type ViewType = 'dashboard' | 'timer';

const Dashboard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
    const [seconds, setSeconds] = useState(0);
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState<GoalData>({ year: '', month: '', week: '', day: '', yearImage: undefined, monthImage: undefined, weekImage: undefined, dayImage: undefined });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const endTimeRef = useRef<number>(0);
    const rafRef = useRef<number | null>(null);
    const audioCtx = useRef<AudioContext | null>(null);

    // Fetch initial data
    useEffect(() => {
        fetchTasks();
        fetchGoals();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // --- HABIT AUTOGENERATION LOGIC ---
            const today = new Date();
            const todayDateStr = today.toISOString().split('T')[0];
            const currentDayOfWeek = today.getDay();

            // Get habits
            const { data: habitsData } = await supabase
                .from('habits')
                .select('*')
                .eq('user_id', user.id);

            if (habitsData && habitsData.length > 0) {
                const habitsToGenerate = habitsData.filter(h => {
                    // Check if generated today
                    if (h.last_generated_date === todayDateStr) return false;
                    // Check if it should repeat today
                    if (h.repeat_type === 'daily') return true;
                    if (h.repeat_type === 'weekly' && h.repeat_day_of_week === currentDayOfWeek) return true;
                    return false;
                });

                if (habitsToGenerate.length > 0) {
                    const todosToInsert = habitsToGenerate.map(h => {
                        let newScheduledAt = null;
                        if (h.scheduled_time) {
                            newScheduledAt = `${todayDateStr}T${h.scheduled_time}Z`;
                        }
                        return {
                            user_id: user.id,
                            task: h.title,
                            estimated_seconds: h.estimated_seconds,
                            location: h.location,
                            purpose: h.purpose,
                            scheduled_at: newScheduledAt,
                            habit_id: h.id,
                        };
                    });

                    await supabase.from('todos').insert(todosToInsert);

                    // Update habits last_generated_date
                    await supabase.from('habits')
                        .update({ last_generated_date: todayDateStr })
                        .in('id', habitsToGenerate.map(h => h.id));
                }
            }
            // --- END HABIT AUTOGENERATION ---

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
                    timeSpent: t.time_spent || 0,
                    estimatedSeconds: t.estimated_seconds || 3600,
                    location: t.location || undefined,
                    purpose: t.purpose || undefined,
                    scheduledAt: t.scheduled_at || undefined,
                    habitId: t.habit_id || undefined,
                }));
                setTasks(mappedTasks);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGoals = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await supabase
                .from('goals')
                .select('goal_type, content, image_url')
                .eq('user_id', user.id);
            if (error) throw error;
            if (data) {
                const g: GoalData = { year: '', month: '', week: '', day: '' };
                data.forEach(row => {
                    if (row.goal_type === 'year') { g.year = row.content || ''; g.yearImage = row.image_url || undefined; }
                    if (row.goal_type === 'month') { g.month = row.content || ''; g.monthImage = row.image_url || undefined; }
                    if (row.goal_type === 'week') { g.week = row.content || ''; g.weekImage = row.image_url || undefined; }
                    if (row.goal_type === 'day') { g.day = row.content || ''; g.dayImage = row.image_url || undefined; }
                });
                setGoals(g);
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    const handleSaveGoal = async (type: 'year' | 'month' | 'week' | 'day', content: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase
                .from('goals')
                .upsert({
                    user_id: user.id,
                    goal_type: type,
                    content,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id,goal_type' });
            if (error) throw error;
            setGoals(prev => ({ ...prev, [type]: content }));
        } catch (error) {
            console.error('Error saving goal:', error);
        }
    };

    const handleSaveGoalImage = async (type: 'year' | 'month' | 'week' | 'day', imageUrl: string | null) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase
                .from('goals')
                .upsert({
                    user_id: user.id,
                    goal_type: type,
                    image_url: imageUrl,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id,goal_type' });
            if (error) throw error;
            const imageKey = `${type}Image` as 'yearImage' | 'monthImage' | 'weekImage' | 'dayImage';
            setGoals(prev => ({ ...prev, [imageKey]: imageUrl || undefined }));
        } catch (error) {
            console.error('Error saving goal image:', error);
        }
    };

    const createTask = async (data: { title: string; estimatedSeconds: number; location?: string; purpose?: string; scheduledAt?: string; repeatType?: 'none' | 'daily' | 'weekly'; repeatDayOfWeek?: number }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            let habitId = null;

            if (data.repeatType && data.repeatType !== 'none') {
                const { data: habitRow, error: habitError } = await supabase
                    .from('habits')
                    .insert({
                        user_id: user.id,
                        title: data.title,
                        estimated_seconds: data.estimatedSeconds,
                        location: data.location || null,
                        purpose: data.purpose || null,
                        scheduled_time: data.scheduledAt ? new Date(data.scheduledAt).toISOString().split('T')[1] : null,
                        repeat_type: data.repeatType,
                        repeat_day_of_week: data.repeatDayOfWeek,
                        last_generated_date: new Date().toISOString().split('T')[0],
                    })
                    .select()
                    .single();

                if (habitError) {
                    console.error('Error creating habit:', habitError);
                } else {
                    habitId = habitRow.id;
                }
            }

            const { data: row, error } = await supabase
                .from('todos')
                .insert({
                    user_id: user.id,
                    task: data.title,
                    estimated_seconds: data.estimatedSeconds,
                    location: data.location || null,
                    purpose: data.purpose || null,
                    scheduled_at: data.scheduledAt || null,
                    habit_id: habitId,
                })
                .select()
                .single();

            if (error) throw error;
            return row ? {
                id: row.id,
                title: row.task,
                completed: row.is_completed,
                timeSpent: 0,
                estimatedSeconds: row.estimated_seconds || 3600,
                location: row.location || undefined,
                purpose: row.purpose || undefined,
                scheduledAt: row.scheduled_at || undefined,
                habitId: row.habit_id || undefined,
            } as Task : null;
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task.');
            return null;
        }
    };

    const updateTaskStatus = async (id: string, is_completed: boolean, time_spent?: number) => {
        try {
            const updates: any = { is_completed };
            if (time_spent !== undefined) updates.time_spent = time_spent;
            const { error } = await supabase.from('todos').update(updates).eq('id', id);
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
            if (durationMinutes < 1) return;
            const { error } = await supabase.from('focus_sessions').insert({
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
            const { error } = await supabase.from('todos').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleFinishDay = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase.from('todos').delete().eq('user_id', user.id);
            if (error) throw error;
            setTasks([]);
            setActiveTaskId(null);
            setTimerStatus('idle');
            setSeconds(0);
            if (currentView === 'timer') setCurrentView('dashboard');
        } catch (error) {
            console.error('Error finishing day:', error);
        }
    };

    // Notification sound
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
        playTone(880, now, 0.5);
        playTone(660, now + 0.25, 0.5);
    };

    // Play a task — start countdown
    const handlePlayTask = (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task || task.completed) return;
        setActiveTaskId(id);
        setSeconds(task.estimatedSeconds);
        setTimerStatus('running');
        setCurrentView('timer');
    };

    const handleToggleTimer = () => {
        if (!activeTaskId) return;
        setTimerStatus(prev => prev === 'running' ? 'paused' : 'running');
    };

    const handleMarkDone = async () => {
        if (!activeTaskId) return;
        const task = tasks.find(t => t.id === activeTaskId);
        if (!task) return;

        const elapsed = task.estimatedSeconds - seconds;
        const newTotalTime = (task.timeSpent || 0) + elapsed;

        setTasks(prev => prev.map(t =>
            t.id === activeTaskId ? { ...t, completed: true, timeSpent: newTotalTime } : t
        ));

        await updateTaskStatus(activeTaskId, true, newTotalTime);
        await logFocusSession(elapsed);

        setTimerStatus('idle');
        setSeconds(0);
        setActiveTaskId(null);
        setCurrentView('dashboard');
    };

    const handleAddTask = async (data: { title: string; estimatedSeconds: number; location?: string; purpose?: string; scheduledAt?: string; repeatType?: 'none' | 'daily' | 'weekly'; repeatDayOfWeek?: number }) => {
        const newTask = await createTask(data);
        if (!newTask) return;
        setTasks(prev => [...prev, newTask]);
    };

    const handleEditTask = async (id: string, data: { title: string; estimatedSeconds: number; location?: string; purpose?: string; scheduledAt?: string }) => {
        try {
            const { error } = await supabase.from('todos').update({
                task: data.title,
                estimated_seconds: data.estimatedSeconds,
                location: data.location || null,
                purpose: data.purpose || null,
                scheduled_at: data.scheduledAt || null,
            }).eq('id', id);
            if (error) throw error;
            setTasks(prev => prev.map(t => t.id === id ? {
                ...t,
                title: data.title,
                estimatedSeconds: data.estimatedSeconds,
                location: data.location,
                purpose: data.purpose,
                scheduledAt: data.scheduledAt,
            } : t));
        } catch (error) {
            console.error('Error editing task:', error);
            alert('Failed to save changes.');
        }
    };

    const handleDeleteTask = async (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        await removeTask(id);
        if (activeTaskId === id) {
            setTimerStatus('idle');
            setSeconds(0);
            setActiveTaskId(null);
            if (currentView === 'timer') setCurrentView('dashboard');
        }
    };

    const handleToggleComplete = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        await updateTaskStatus(id, !task.completed);
        if (activeTaskId === id) {
            setTimerStatus('idle');
            setSeconds(0);
            setActiveTaskId(null);
        }
    };

    const handleReset = () => {
        if (!activeTaskId) return;
        const task = tasks.find(t => t.id === activeTaskId);
        if (!task) return;
        setTimerStatus('idle');
        setSeconds(task.estimatedSeconds);
    };

    const handleBackToDashboard = () => {
        setTimerStatus('idle');
        setSeconds(0);
        setActiveTaskId(null);
        setCurrentView('dashboard');
    };

    // Wall-clock based countdown timer
    // Instead of relying on setInterval ticks (which Chrome throttles in
    // background tabs), we store the real end-time and always compute
    // remaining = endTime - Date.now(). This keeps the timer accurate even
    // when the browser throttles intervals.
    useEffect(() => {
        if (timerStatus === 'running') {
            // Capture the wall-clock end time from current remaining seconds
            endTimeRef.current = Date.now() + seconds * 1000;

            const onTimerFinished = () => {
                playNotification();
                setTimerStatus('idle');
                setSeconds(0);
                if (activeTaskId) {
                    const task = tasks.find(t => t.id === activeTaskId);
                    if (task) {
                        const newTotalTime = (task.timeSpent || 0) + task.estimatedSeconds;
                        setTasks(prev => prev.map(t =>
                            t.id === activeTaskId ? { ...t, completed: true, timeSpent: newTotalTime } : t
                        ));
                        updateTaskStatus(activeTaskId, true, newTotalTime);
                        logFocusSession(task.estimatedSeconds);
                    }
                    setActiveTaskId(null);
                    setCurrentView('dashboard');
                }
            };

            const tick = () => {
                const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);
                if (remaining <= 0) {
                    onTimerFinished();
                } else {
                    setSeconds(remaining);
                }
            };

            // Use a fast interval (250ms) — each tick is cheap since it just
            // reads Date.now(). Even if Chrome throttles this to once/sec in
            // the background, the computed remaining time is always correct.
            timerRef.current = setInterval(tick, 250);

            // Instantly catch up when the user returns to this tab
            const handleVisibility = () => {
                if (document.visibilityState === 'visible') {
                    tick();
                }
            };
            document.addEventListener('visibilitychange', handleVisibility);

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                document.removeEventListener('visibilitychange', handleVisibility);
            };
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            return undefined;
        }
        // Note: we intentionally only re-run this effect when timerStatus changes.
        // We do NOT include `seconds` because that would reset endTimeRef on every tick.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timerStatus, activeTaskId, tasks]);

    return (
        <div className="relative h-screen w-full bg-[#0d0814] text-white overflow-hidden select-none">

            {/* User Profile Menu */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50">
                <UserProfileMenu />
            </div>

            {/* View Rendering */}
            {currentView === 'timer' ? (
                <TimerView
                    timerStatus={timerStatus}
                    seconds={seconds}
                    activeTaskId={activeTaskId}
                    tasks={tasks}
                    onToggleTimer={handleToggleTimer}
                    onMarkDone={handleMarkDone}
                    onReset={handleReset}
                    onBack={handleBackToDashboard}
                />
            ) : (
                <TaskDashboard
                    tasks={tasks}
                    activeTaskId={activeTaskId}
                    onPlayTask={handlePlayTask}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                    loading={loading}
                    goals={goals}
                    onSaveGoal={handleSaveGoal}
                    onSaveGoalImage={handleSaveGoalImage}
                    onFinishDay={handleFinishDay}
                />
            )}
        </div>
    );
};

export default Dashboard;
