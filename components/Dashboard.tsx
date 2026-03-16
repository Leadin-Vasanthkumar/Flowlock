import React, { useState, useEffect, useRef } from 'react';
import TaskDashboard from './TaskDashboard';
import FolderView from './FolderView';
import ResizableLayout from './ResizableLayout';
import TimerView from './TimerView';
import GuidedBreak, { BreakPhase, BreakActivity } from './GuidedBreak';
import GoalsPanel, { GoalData } from './GoalsPanel';
import AnalysisPage from './AnalysisPage';
import UserProfileMenu from './UserProfileMenu';
import { Task, TimerStatus, PomodoroProfile, Folder, RecurrenceType, TimeBlock } from '../types';
import { supabase } from '../lib/supabase';

type ViewType = 'dashboard' | 'timer' | 'guided-break' | 'analysis';

const Dashboard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
    const [seconds, setSeconds] = useState(0);
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState<GoalData>({ year: '', month: '', week: '', yearImage: undefined, monthImage: undefined, weekImage: undefined });
    const [showMobileGoals, setShowMobileGoals] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const endTimeRef = useRef<number>(0);
    const rafRef = useRef<number | null>(null);
    const audioCtx = useRef<AudioContext | null>(null);

    // Guided break state
    const [breakPhase, setBreakPhase] = useState<BreakPhase>('victory');
    const [breakActivity, setBreakActivity] = useState<BreakActivity | null>(null);
    const [breakSeconds, setBreakSeconds] = useState(300); // 5 minutes
    const [completedTaskName, setCompletedTaskName] = useState('');
    const [autoContinueTaskId, setAutoContinueTaskId] = useState<string | null>(null);

    // Fetch initial data
    useEffect(() => {
        fetchTasks();
        fetchFolders();
        fetchGoals();
    }, []);

    // Handle daily reset at midnight
    useEffect(() => {
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const timeUntilMidnight = midnight.getTime() - now.getTime();

        const timer = setTimeout(() => {
            fetchTasks();
            fetchFolders();
        }, timeUntilMidnight);

        return () => clearTimeout(timer);
    }, [tasks, folders]); // Re-set timer if data changes

    const fetchTasks = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // --- DAILY AUTO-RESET: handle recurring vs one-time tasks ---
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            
            const { data: staleTasks } = await supabase
                .from('todos')
                .select('id, inserted_at, recurrence_type')
                .eq('user_id', user.id);

            if (staleTasks && staleTasks.length > 0) {
                const hasStale = staleTasks.some(t => new Date(t.inserted_at) < todayStart);
                if (hasStale) {
                    // 1. Delete all one-time tasks
                    await supabase.from('todos')
                        .delete()
                        .eq('user_id', user.id)
                        .eq('recurrence_type', 'none');

                    // 2. Reset recurring tasks (daily/weekly)
                    await supabase.from('todos')
                        .update({ is_completed: false, pomodoros_completed: 0, time_spent: 0 })
                        .eq('user_id', user.id)
                        .neq('recurrence_type', 'none');
                        
                    // 3. Update inserted_at so we don't trigger reset again today
                    await supabase.from('todos')
                        .update({ inserted_at: new Date().toISOString() })
                        .eq('user_id', user.id);
                }
            }
            // --- END DAILY AUTO-RESET ---

            const { data, error } = await supabase
                .from('todos')
                .select('*, folders(id, name)')
                .eq('user_id', user.id)
                .order('inserted_at', { ascending: true });

            if (error) throw error;

            if (data) {
                const today = new Date().getDay(); // 0-6 Sun-Sat
                
                const mappedTasks: Task[] = data.map(t => ({
                    id: t.id,
                    title: t.task,
                    completed: t.is_completed,
                    timeSpent: t.time_spent || 0,
                    pomodoroProfile: (t.estimated_seconds === 5400 ? '90-10' : t.estimated_seconds === 3000 ? '50-10' : '25-5') as PomodoroProfile,
                    pomodorosRequired: t.pomodoros_required || 1,
                    pomodorosCompleted: t.pomodoros_completed || 0,
                    folderId: t.folder_id || undefined,
                    recurrenceType: (t.recurrence_type || 'none') as RecurrenceType,
                    recurrenceDays: t.recurrence_days || []
                })).filter(t => {
                    // Filter based on recurrence
                    if (t.recurrenceType === 'none') return true;
                    if (t.recurrenceType === 'daily') return true;
                    if (t.recurrenceType === 'weekly') {
                        return t.recurrenceDays?.includes(today);
                    }
                    return true;
                });
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
                const g: GoalData = { year: '', month: '', week: '' };
                data.forEach(row => {
                    if (row.goal_type === 'year') { g.year = row.content || ''; g.yearImage = row.image_url || undefined; }
                    if (row.goal_type === 'month') { g.month = row.content || ''; g.monthImage = row.image_url || undefined; }
                    if (row.goal_type === 'week') { g.week = row.content || ''; g.weekImage = row.image_url || undefined; }
                });
                setGoals(g);
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    const fetchFolders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toLocaleDateString('en-CA');

            // Fetch folders
            const { data: foldersData, error: foldersError } = await supabase
                .from('folders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (foldersError) throw foldersError;

            // Fetch today's completions
            const { data: completionsData, error: completionsError } = await supabase
                .from('folder_completions')
                .select('folder_id')
                .eq('user_id', user.id)
                .eq('completed_date', today);

            if (completionsError) throw completionsError;

            const completedFolderIds = new Set(completionsData.map(c => c.folder_id));

            if (foldersData) {
                setFolders(foldersData.map((f: any) => {
                    const uncompletedTasksInFolder = tasks.filter(t => t.folderId === f.id && !t.completed).length;
                    return {
                        id: f.id,
                        name: f.name,
                        description: f.description,
                        isHabit: f.is_habit,
                        startTime: f.start_time,
                        endTime: f.end_time,
                        timeBlocks: f.time_blocks || [],
                        isCompletedToday: completedFolderIds.has(f.id),
                        progress: uncompletedTasksInFolder
                    };
                }));
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

    const handleAddFolder = async (name: string, startTime?: string, endTime?: string, timeBlocks: TimeBlock[] = []) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            // For backward compatibility and immediate display, we can use the first block as start/end time
            const firstBlock = timeBlocks[0] || (startTime ? { startTime, endTime: endTime || '' } : null);
            
            const { data, error } = await supabase.from('folders')
                .insert([{ 
                    user_id: user.id, 
                    name,
                    start_time: firstBlock?.startTime || null,
                    end_time: firstBlock?.endTime || null,
                    time_blocks: timeBlocks
                }])
                .select()
                .single();
            if (error) throw error;
            if (data) fetchFolders();
        } catch (error) {
            console.error('Error adding folder:', error);
        }
    };

    const handleUpdateFolder = async (id: string, data: { name: string; startTime?: string; endTime?: string; timeBlocks?: TimeBlock[] }) => {
        try {
            const firstBlock = data.timeBlocks?.[0];
            
            const { error } = await supabase.from('folders')
                .update({ 
                    name: data.name,
                    start_time: firstBlock?.startTime || data.startTime || null,
                    end_time: firstBlock?.endTime || data.endTime || null,
                    time_blocks: data.timeBlocks || []
                })
                .eq('id', id);
            if (error) throw error;
            fetchFolders();
        } catch (error) {
            console.error('Error updating folder:', error);
            alert('Failed to update folder.');
        }
    };

    const handleDeleteFolder = async (id: string) => {
        if (!confirm('Are you sure? This will delete all tasks in this folder.')) return;
        try {
            const { error } = await supabase.from('folders').delete().eq('id', id);
            if (error) throw error;
            if (activeFolderId === id) setActiveFolderId(null);
            fetchFolders();
            fetchTasks(); // cleanup tasks
        } catch (error) {
            console.error('Error deleting folder:', error);
        }
    };


    const handleUpdateFolderDescription = async (id: string, description: string) => {
        try {
            const { error } = await supabase
                .from('folders')
                .update({ description })
                .eq('id', id);
            if (error) throw error;
            setFolders(prev => prev.map(f => f.id === id ? { ...f, description } : f));
        } catch (error) {
            console.error('Error updating folder description:', error);
        }
    };

    const handleToggleFolderCompletion = async (id: string) => {
        try {
            const { data: { user } = {} } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toLocaleDateString('en-CA');
            const folder = folders.find(f => f.id === id);
            if (!folder) return;

            if (folder.isCompletedToday) {
                // Remove completion
                const { error } = await supabase
                    .from('folder_completions')
                    .delete()
                    .eq('folder_id', id)
                    .eq('completed_date', today);
                if (error) throw error;
            } else {
                // Add completion
                const { error } = await supabase
                    .from('folder_completions')
                    .insert({ folder_id: id, user_id: user.id, completed_date: today });
                if (error) throw error;
            }

            setFolders(prev => prev.map(f => 
                f.id === id ? { ...f, isCompletedToday: !f.isCompletedToday } : f
            ));
        } catch (error) {
            console.error('Error toggling folder completion:', error);
        }
    };


    const handleSaveGoal = async (type: 'year' | 'month' | 'week', content: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const imageKey = `${type}Image` as 'yearImage' | 'monthImage' | 'weekImage';
            const { error } = await supabase
                .from('goals')
                .upsert({
                    user_id: user.id,
                    goal_type: type,
                    content,
                    image_url: goals[imageKey] || null,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id,goal_type' });
            if (error) throw error;
            setGoals(prev => ({ ...prev, [type]: content }));
        } catch (error) {
            console.error('Error saving goal:', error);
        }
    };

    const handleSaveGoalImage = async (type: 'year' | 'month' | 'week', imageUrl: string | null) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase
                .from('goals')
                .upsert({
                    user_id: user.id,
                    goal_type: type,
                    content: goals[type] || '',
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

    const createTask = async (data: { 
        title: string; 
        pomodoroProfile: PomodoroProfile; 
        pomodorosRequired: number;
        recurrenceType: RecurrenceType;
        recurrenceDays?: number[];
    }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const secondsMap: Record<PomodoroProfile, number> = {
                '25-5': 1500,
                '50-10': 3000,
                '90-10': 5400
            };
            const mappedSeconds = secondsMap[data.pomodoroProfile] || 1500;

            const { data: row, error } = await supabase
                .from('todos')
                .insert({
                    user_id: user.id,
                    task: data.title,
                    estimated_seconds: mappedSeconds,
                    pomodoros_required: data.pomodorosRequired,
                    pomodoros_completed: 0,
                    location: null,
                    purpose: null,
                    scheduled_at: null,
                    folder_id: activeFolderId,
                    recurrence_type: data.recurrenceType,
                    recurrence_days: data.recurrenceDays
                })
                .select()
                .single();

            if (error) throw error;
            return row ? {
                id: row.id,
                title: row.task,
                completed: row.is_completed,
                timeSpent: 0,
                pomodoroProfile: data.pomodoroProfile,
                pomodorosRequired: data.pomodorosRequired,
                pomodorosCompleted: 0,
                folderId: row.folder_id || undefined,
                recurrenceType: row.recurrence_type as RecurrenceType,
                recurrenceDays: row.recurrence_days || []
            } as Task : null;
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task.');
            return null;
        }
    };

    const updateTaskStatus = async (id: string, is_completed: boolean, time_spent?: number, pomodoros_completed?: number) => {
        try {
            const updates: any = { is_completed };
            if (time_spent !== undefined) updates.time_spent = time_spent;
            if (pomodoros_completed !== undefined) updates.pomodoros_completed = pomodoros_completed;
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
        const secondsMap: Record<PomodoroProfile, number> = {
            '25-5': 1500,
            '50-10': 3000,
            '90-10': 5400
        };
        setSeconds(secondsMap[task.pomodoroProfile] || 1500);
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

        const secondsMap: Record<PomodoroProfile, number> = {
            '25-5': 1500,
            '50-10': 3000,
            '90-10': 5400
        };
        const taskTotalSeconds = secondsMap[task.pomodoroProfile] || 1500;
        const elapsed = taskTotalSeconds - seconds;
        const newTotalTime = (task.timeSpent || 0) + elapsed;
        const newPomodorosCompleted = (task.pomodorosCompleted || 0) + 1;
        const isFullyCompleted = newPomodorosCompleted >= (task.pomodorosRequired || 1);

        setTasks(prev => prev.map(t =>
            t.id === activeTaskId ? { ...t, completed: isFullyCompleted, timeSpent: newTotalTime, pomodorosCompleted: newPomodorosCompleted } : t
        ));

        await updateTaskStatus(activeTaskId, isFullyCompleted, newTotalTime, newPomodorosCompleted);
        await logFocusSession(elapsed);

        setTimerStatus('idle');
        setSeconds(0);
        setActiveTaskId(null);

        if (taskTotalSeconds > 0) {
            setCompletedTaskName(task.title);
            setBreakPhase(isFullyCompleted ? 'victory' : 'select');
            setBreakActivity(null);
            setAutoContinueTaskId(isFullyCompleted ? null : task.id);

            // Break map from pomodoro profile
            const breakMap: Record<PomodoroProfile, number> = {
                '25-5': 300,  // 5 mins
                '50-10': 600, // 10 mins
                '90-10': 600, // 10 mins
            };
            setBreakSeconds(breakMap[task.pomodoroProfile] || 300);
            setCurrentView('guided-break');
        } else {
            setCurrentView('dashboard');
        }
    };

    const handleAddTask = async (data: { 
        title: string; 
        pomodoroProfile: PomodoroProfile; 
        pomodorosRequired: number;
        recurrenceType: RecurrenceType;
        recurrenceDays?: number[];
    }) => {
        const newTask = await createTask(data);
        if (!newTask) return;
        setTasks(prev => [...prev, newTask]);
    };

    const handleEditTask = async (id: string, data: { 
        title: string; 
        pomodoroProfile: PomodoroProfile; 
        pomodorosRequired: number;
        recurrenceType: RecurrenceType;
        recurrenceDays?: number[];
    }) => {
        try {
            const secondsMap: Record<PomodoroProfile, number> = {
                '25-5': 1500,
                '50-10': 3000,
                '90-10': 5400
            };
            const mappedSeconds = secondsMap[data.pomodoroProfile] || 1500;

            const { error } = await supabase.from('todos').update({
                task: data.title,
                estimated_seconds: mappedSeconds,
                pomodoros_required: data.pomodorosRequired,
                recurrence_type: data.recurrenceType,
                recurrence_days: data.recurrenceDays,
                location: null,
                purpose: null,
                scheduled_at: null,
            }).eq('id', id);
            if (error) throw error;
            setTasks(prev => prev.map(t => t.id === id ? {
                ...t,
                title: data.title,
                pomodoroProfile: data.pomodoroProfile,
                pomodorosRequired: data.pomodorosRequired,
                recurrenceType: data.recurrenceType,
                recurrenceDays: data.recurrenceDays || []
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
            if (currentView === 'timer') {
                setCurrentView('dashboard');
            }
        }
    };

    const handleToggleComplete = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const isMarkingComplete = !task.completed;
        
        if (isMarkingComplete) {
            const secondsMap: Record<PomodoroProfile, number> = {
                '25-5': 1500,
                '50-10': 3000,
                '90-10': 5400
            };
            const taskTotalSeconds = secondsMap[task.pomodoroProfile] || 1500;
            const requiredSeconds = taskTotalSeconds * (task.pomodorosRequired || 1);
            const missingSeconds = requiredSeconds - (task.timeSpent || 0);

            if (missingSeconds > 0) {
                // If they forgot the timer, we credit them the full remaining time
                setTasks(prev => prev.map(t =>
                    t.id === id ? { ...t, completed: true, timeSpent: requiredSeconds, pomodorosCompleted: t.pomodorosRequired } : t
                ));
                await updateTaskStatus(id, true, requiredSeconds, task.pomodorosRequired);
                await logFocusSession(missingSeconds);
            } else {
                setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
                await updateTaskStatus(id, true);
            }
        } else {
            // Unchecking — just toggle status
            setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: false } : t));
            await updateTaskStatus(id, false);
        }

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

        const secondsMap: Record<PomodoroProfile, number> = {
            '25-5': 1500,
            '50-10': 3000,
            '90-10': 5400
        };
        setSeconds(secondsMap[task.pomodoroProfile] || 1500);

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
                        const secondsMap: Record<PomodoroProfile, number> = {
                            '25-5': 1500,
                            '50-10': 3000,
                            '90-10': 5400
                        };
                        const taskTotalSeconds = secondsMap[task.pomodoroProfile] || 1500;
                        const newTotalTime = (task.timeSpent || 0) + taskTotalSeconds;
                        const newPomodorosCompleted = (task.pomodorosCompleted || 0) + 1;
                        const isFullyCompleted = newPomodorosCompleted >= (task.pomodorosRequired || 1);

                        setTasks(prev => prev.map(t =>
                            t.id === activeTaskId ? { ...t, completed: isFullyCompleted, timeSpent: newTotalTime, pomodorosCompleted: newPomodorosCompleted } : t
                        ));
                        updateTaskStatus(activeTaskId, isFullyCompleted, newTotalTime, newPomodorosCompleted);
                        logFocusSession(taskTotalSeconds);

                        // Enter guided break flow
                        setCompletedTaskName(task.title);
                        setBreakPhase(isFullyCompleted ? 'victory' : 'select');
                        setBreakActivity(null);
                        setAutoContinueTaskId(isFullyCompleted ? null : task.id);

                        // Break map from pomodoro profile
                        const breakMap: Record<PomodoroProfile, number> = {
                            '25-5': 300,  // 5 mins
                            '50-10': 600, // 10 mins
                            '90-10': 600, // 10 mins
                        };
                        setBreakSeconds(breakMap[task.pomodoroProfile] || 300);
                        setCurrentView('guided-break');
                    }
                    setActiveTaskId(null);
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

    // ── Break countdown timer ──────────────────────────────
    const breakTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const breakEndTimeRef = useRef<number>(0);

    useEffect(() => {
        if (currentView === 'guided-break' && breakPhase === 'active') {
            breakEndTimeRef.current = Date.now() + breakSeconds * 1000 + 100;

            const tick = () => {
                const remaining = Math.round((breakEndTimeRef.current - Date.now()) / 1000);
                if (remaining <= 0) {
                    setBreakSeconds(0);
                    if (autoContinueTaskId) {
                        handleBreakContinue(autoContinueTaskId);
                    } else {
                        // Scope check to active folder only
                        const sameFolderTasks = tasks.filter(t => !t.completed && t.pomodoroProfile && t.folderId === activeFolderId);
                        setBreakPhase(sameFolderTasks.length > 0 ? 'decision' : 'all-done');
                    }
                } else {
                    setBreakSeconds(remaining);
                }
            };

            breakTimerRef.current = setInterval(tick, 250);
            return () => {
                if (breakTimerRef.current) clearInterval(breakTimerRef.current);
            };
        } else {
            if (breakTimerRef.current) clearInterval(breakTimerRef.current);
            return undefined;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentView, breakPhase, autoContinueTaskId, tasks, activeFolderId]);

    // ── Midnight auto-reset timer ──────────────────────────
    useEffect(() => {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // next midnight
        const msUntilMidnight = midnight.getTime() - now.getTime();

        const timer = setTimeout(() => {
            // Clear local state immediately
            setTasks([]);
            setActiveTaskId(null);
            setTimerStatus('idle');
            setSeconds(0);
            if (currentView === 'timer' || currentView === 'guided-break') {
                setCurrentView('dashboard');
            }
            // Re-fetch: will wipe stale todos + regenerate habits
            fetchTasks();
        }, msUntilMidnight);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Break handlers ─────────────────────────────────────
    const handleStartUnscheduledBreak = () => {
        setCompletedTaskName('');
        setBreakPhase('select');
        setCurrentView('guided-break');
    };

    const handleDrinkWater = () => setBreakPhase('select');

    const handleSelectBreakActivity = (activity: BreakActivity) => {
        setBreakActivity(activity);
        setBreakSeconds(activity === 'stretches' ? 120 : activity === 'walking' ? 600 : 300);
        setBreakPhase('active');
    };

    const handleSkipBreak = () => {
        if (autoContinueTaskId) {
            handleBreakContinue(autoContinueTaskId);
        } else {
            const sameFolderTasks = tasks.filter(t => !t.completed && t.pomodoroProfile && t.folderId === activeFolderId);
            setBreakPhase(sameFolderTasks.length > 0 ? 'decision' : 'all-done');
        }
    };

    const handleBreakDone = () => {
        setCurrentView('dashboard');
    };

    const handleBreakContinue = (taskId: string) => {
        setCurrentView('dashboard'); // briefly reset
        handlePlayTask(taskId);      // immediately starts the new timer
    };

    return (
        <div className="relative h-screen w-full bg-[#0D0E0D] text-white overflow-hidden select-none">

            {/* View Rendering */}
            {currentView === 'guided-break' ? (
                <GuidedBreak
                    phase={breakPhase}
                    taskName={completedTaskName}
                    breakActivity={breakActivity}
                    breakSeconds={breakSeconds}
                    remainingTasks={tasks.filter(t => !t.completed && t.pomodoroProfile && t.folderId === activeFolderId)}
                    autoContinueTaskId={autoContinueTaskId}
                    onDrinkWater={handleDrinkWater}
                    onSelectActivity={handleSelectBreakActivity}
                    onSkipBreak={handleSkipBreak}
                    onDone={handleBreakDone}
                    onContinue={handleBreakContinue}
                    onBack={() => setCurrentView('dashboard')}
                    onBackToOptions={() => setBreakPhase('select')}
                    onTimerReset={() => {
                        const duration = breakActivity === 'walking' ? 600 : breakActivity === 'stretches' ? 120 : 300;
                        setBreakSeconds(duration);
                        breakEndTimeRef.current = Date.now() + duration * 1000 + 100;
                    }}
                />
            ) : currentView === 'timer' ? (
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
            ) : currentView === 'analysis' ? (
                <AnalysisPage
                    tasks={tasks}
                    folders={folders}
                    currentView={currentView}
                    onToggleView={() => setCurrentView('dashboard')}
                    onBack={() => setCurrentView('dashboard')}
                />
            ) : (
                <ResizableLayout
                    sidebarContent={
                        <GoalsPanel 
                            goals={goals} 
                            onSaveGoal={handleSaveGoal} 
                            onSaveGoalImage={handleSaveGoalImage} 
                        />
                    }
                    mobileFAB={
                        <button
                            onClick={() => setShowMobileGoals(true)}
                            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform cursor-pointer bg-[#22C55E]"
                            aria-label="View Goals"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D0E0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="6" />
                                <circle cx="12" cy="12" r="2" />
                            </svg>
                        </button>
                    }
                    mobileOverlay={
                        showMobileGoals && (
                            <div className="fixed inset-0 z-50 flex flex-col">
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileGoals(false)} />
                                <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl" style={{ background: '#0D0E0D', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}>
                                    <div className="flex justify-center pt-3 pb-1">
                                        <div className="w-10 h-1 rounded-full bg-white/15" />
                                    </div>
                                    <button onClick={() => setShowMobileGoals(false)} className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors cursor-pointer">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                    <GoalsPanel goals={goals} onSaveGoal={handleSaveGoal} onSaveGoalImage={handleSaveGoalImage} />
                                </div>
                            </div>
                        )
                    }
                >
                    {activeFolderId ? (
                        <FolderView
                            folderId={activeFolderId}
                            folderName={folders.find(f => f.id === activeFolderId)?.name || 'Folder'}
                            description={folders.find(f => f.id === activeFolderId)?.description || ''}
                            startTime={folders.find(f => f.id === activeFolderId)?.startTime}
                            endTime={folders.find(f => f.id === activeFolderId)?.endTime}
                            timeBlocks={folders.find(f => f.id === activeFolderId)?.timeBlocks}
                            onUpdateDescription={handleUpdateFolderDescription}
                            onUpdateFolder={handleUpdateFolder}
                            pendingTasks={tasks.filter(t => !t.completed && t.folderId === activeFolderId)}
                            completedTasks={tasks.filter(t => t.completed && t.folderId === activeFolderId)}
                            activeTaskId={activeTaskId}
                            editingTaskId={editingTaskId}
                            saving={saving}
                            onAddTask={handleAddTask}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                            onToggleComplete={handleToggleComplete}
                            onPlayTask={handlePlayTask}
                            setEditingTaskId={setEditingTaskId}
                            setSaving={setSaving}
                            loading={loading}
                            onStartBreak={handleStartUnscheduledBreak}
                            onBack={() => {
                                setActiveFolderId(null);
                                setEditingTaskId(null);
                            }}
                        />
                    ) : (
                        <TaskDashboard
                            folders={folders.map(f => ({ 
                                ...f, 
                                progress: tasks.filter(t => t.folderId === f.id && !t.completed).length 
                            }))}
                            onAddFolder={handleAddFolder}
                            onUpdateFolder={handleUpdateFolder}
                            onSelectFolder={setActiveFolderId}
                            onDeleteFolder={handleDeleteFolder}
                            onToggleFolderCompletion={handleToggleFolderCompletion}
                            loading={loading}
                            onStartBreak={handleStartUnscheduledBreak}
                            currentView="dashboard"
                            onToggleView={() => setCurrentView('analysis')}
                        />
                    )}
                </ResizableLayout>
            )}
        </div>
    );
};

export default Dashboard;
