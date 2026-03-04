'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Swords, Flame, Clock, Zap, CheckCircle2, Circle,
    ArrowRight, TrendingUp, Calendar
} from 'lucide-react'
import { format } from 'date-fns'

interface DashboardData {
    score: number
    breakdown: { habit: number; task: number; time: number; streak: number }
    todayHabits: Array<{ id: string; name: string; icon: string; color: string; completed: boolean }>
    battlePlan: Array<{ id: string; title: string; priority: string; dueDate: string | null }>
    upcomingEvents: Array<{ id: string; title: string; eventType: string; startDate: string; startTime: string | null }>
    stats: { habitsToday: number; habitsDone: number; tasksPending: number; tasksDone: number }
}

export default function WarRoomPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [energy, setEnergy] = useState<string | null>(null)

    useEffect(() => { loadDashboard() }, [])

    const loadDashboard = async () => {
        try {
            const [habitsRes, todosRes, eventsRes, scoreRes] = await Promise.all([
                fetch('/api/habits').then(r => r.json()),
                fetch('/api/todos').then(r => r.json()),
                fetch('/api/events').then(r => r.json()),
                fetch('/api/analytics/score').then(r => r.json()),
            ])
            const today = format(new Date(), 'yyyy-MM-dd')
            const dayOfWeek = new Date().getDay() || 7
            const todayHabits = (habitsRes || [])
                .filter((h: { targetDays: string }) => h.targetDays.split(',').map(Number).includes(dayOfWeek))
                .map((h: { id: string; name: string; icon: string; color: string; logs: Array<{ logDate: string }> }) => ({
                    id: h.id, name: h.name, icon: h.icon, color: h.color,
                    completed: (h.logs || []).some((l: { logDate: string }) => l.logDate === today),
                }))
            const allTasks = todosRes || []
            const pendingTasks = allTasks
                .filter((t: { status: string }) => t.status !== 'completed' && t.status !== 'cancelled')
                .sort((a: { priority: string }, b: { priority: string }) => {
                    const order: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
                    return (order[a.priority] || 2) - (order[b.priority] || 2)
                }).slice(0, 5)
            const threeDaysFromNow = format(new Date(Date.now() + 72 * 60 * 60 * 1000), 'yyyy-MM-dd')
            const upcoming = (eventsRes || [])
                .filter((e: { startDate: string }) => e.startDate >= today && e.startDate <= threeDaysFromNow).slice(0, 5)
            setData({
                score: scoreRes.score || 0,
                breakdown: scoreRes.breakdown || { habit: 0, task: 0, time: 0, streak: 0 },
                todayHabits, battlePlan: pendingTasks, upcomingEvents: upcoming,
                stats: {
                    habitsToday: todayHabits.length,
                    habitsDone: todayHabits.filter((h: { completed: boolean }) => h.completed).length,
                    tasksPending: pendingTasks.length,
                    tasksDone: allTasks.filter((t: { status: string }) => t.status === 'completed').length,
                },
            })
        } catch (err) {
            console.error(err)
            setData({ score: 0, breakdown: { habit: 0, task: 0, time: 0, streak: 0 }, todayHabits: [], battlePlan: [], upcomingEvents: [], stats: { habitsToday: 0, habitsDone: 0, tasksPending: 0, tasksDone: 0 } })
        } finally { setLoading(false) }
    }

    const toggleHabit = async (habitId: string) => {
        await fetch(`/api/habits/${habitId}/complete`, { method: 'POST' })
        loadDashboard()
    }

    const logEnergy = async (level: string) => {
        setEnergy(level)
        await fetch('/api/energy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level, logDate: format(new Date(), 'yyyy-MM-dd') }) }).catch(() => { })
    }

    if (loading) return <div className="flex items-center justify-center h-[80vh]"><div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-purple)', borderTopColor: 'transparent' }} /></div>

    const getScoreColor = (s: number) => s >= 800 ? '#39d353' : s >= 600 ? '#26a641' : s >= 400 ? '#d29922' : s >= 200 ? '#f97316' : '#f85149'
    const priorityColors: Record<string, string> = { urgent: '#f85149', high: '#f97316', medium: '#d29922', low: '#58a6ff' }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '48px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Swords style={{ width: '32px', height: '32px', color: '#f85149' }} />
                    War Room
                </h1>
                <p style={{ fontSize: '16px', marginTop: '8px', color: 'var(--text-secondary)' }}>
                    {format(new Date(), 'EEEE, MMMM d, yyyy')} — Your daily command center
                </p>
            </div>

            {/* TOP ROW: Score + 3 Stats in a 2-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>

                {/* Discipline Score - Big card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '16px' }}>Discipline Score</p>
                    <div className="font-mono-nums" style={{ fontSize: '72px', fontWeight: 900, lineHeight: 1, color: getScoreColor(data?.score || 0) }}>
                        {data?.score || 0}
                    </div>
                    <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>/1000</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
                        {[
                            { label: 'Habits', value: data?.breakdown.habit || 0, max: 400, color: 'var(--accent-green)' },
                            { label: 'Tasks', value: data?.breakdown.task || 0, max: 300, color: 'var(--accent-blue)' },
                            { label: 'Study', value: data?.breakdown.time || 0, max: 200, color: 'var(--accent-cyan)' },
                            { label: 'Streak', value: data?.breakdown.streak || 0, max: 100, color: 'var(--accent-amber)' },
                        ].map(item => (
                            <div key={item.label} style={{ padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-tertiary)' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: item.color }}>{item.label}</span>
                                <div className="font-mono-nums" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{item.value}/{item.max}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right side: 3 stat cards stacked */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                        { label: 'Habits Done', value: `${data?.stats.habitsDone ?? 0} / ${data?.stats.habitsToday ?? 0}`, icon: CheckCircle2, color: '#39d353', sub: 'today\'s habits' },
                        { label: 'Tasks Pending', value: `${data?.stats.tasksPending ?? 0}`, icon: Clock, color: '#58a6ff', sub: 'active tasks' },
                        { label: 'Tasks Done', value: `${data?.stats.tasksDone ?? 0}`, icon: TrendingUp, color: '#a855f7', sub: 'completed total' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * (i + 1) }}
                            className="glass-card glass-card-hover"
                            style={{ padding: '28px 32px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>{stat.label}</p>
                                <div className="font-mono-nums" style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{stat.sub}</p>
                            </div>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon style={{ width: '28px', height: '28px', color: stat.color }} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* MIDDLE ROW: Battle Plan + Energy */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>

                {/* Battle Plan */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '36px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                        <Swords style={{ width: '22px', height: '22px', color: '#f85149' }} />
                        Today&apos;s Battle Plan
                    </h2>
                    {(!data?.battlePlan || data.battlePlan.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Swords style={{ width: '48px', height: '48px', color: 'var(--text-muted)', opacity: 0.2, margin: '0 auto 16px' }} />
                            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>No pending tasks. Add some in Tasks.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {data?.battlePlan.map((task, i) => (
                                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderRadius: '14px', background: 'var(--bg-tertiary)', borderLeft: `4px solid ${priorityColors[task.priority] || '#d29922'}` }}>
                                    <span className="font-mono-nums" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-muted)', width: '32px', textAlign: 'center' }}>{String(i + 1).padStart(2, '0')}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{task.priority.toUpperCase()} {task.dueDate ? `• Due ${task.dueDate}` : ''}</p>
                                    </div>
                                    <ArrowRight style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Energy Check-In */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '36px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <Zap style={{ width: '22px', height: '22px', color: '#d29922' }} />
                        Energy Check-In
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>How are you feeling right now?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { level: 'low', emoji: '😴', label: 'Low Energy', color: '#f85149' },
                            { level: 'medium', emoji: '😐', label: 'Medium', color: '#d29922' },
                            { level: 'high', emoji: '🔥', label: 'High Energy', color: '#39d353' },
                        ].map((e) => (
                            <button key={e.level} onClick={() => logEnergy(e.level)}
                                style={{
                                    padding: '20px', borderRadius: '14px', textAlign: 'center',
                                    background: energy === e.level ? `${e.color}20` : 'var(--bg-tertiary)',
                                    border: energy === e.level ? `2px solid ${e.color}` : '2px solid transparent',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                }}>
                                <span style={{ fontSize: '36px' }}>{e.emoji}</span>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>{e.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* BOTTOM ROW: Habits + Events */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Today's Habits */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: '36px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                        <Flame style={{ width: '22px', height: '22px', color: '#39d353' }} />
                        Today&apos;s Habits
                    </h2>
                    {(!data?.todayHabits || data.todayHabits.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Flame style={{ width: '48px', height: '48px', color: 'var(--text-muted)', opacity: 0.2, margin: '0 auto 16px' }} />
                            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>No habits scheduled today.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {data?.todayHabits.map((habit) => (
                                <button key={habit.id} onClick={() => toggleHabit(habit.id)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '16px',
                                        padding: '16px 20px', borderRadius: '14px', textAlign: 'left', cursor: 'pointer',
                                        background: habit.completed ? 'rgba(57, 211, 83, 0.1)' : 'var(--bg-tertiary)',
                                        border: habit.completed ? '1px solid rgba(57, 211, 83, 0.3)' : '1px solid transparent',
                                        transition: 'all 0.2s',
                                    }}>
                                    {habit.completed ? <CheckCircle2 style={{ width: '24px', height: '24px', color: '#39d353', flexShrink: 0 }} /> : <Circle style={{ width: '24px', height: '24px', color: 'var(--text-muted)', flexShrink: 0 }} />}
                                    <span style={{ fontSize: '24px' }}>{habit.icon}</span>
                                    <span style={{ fontSize: '15px', fontWeight: 600, color: habit.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: habit.completed ? 'line-through' : 'none' }}>{habit.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Upcoming Events */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card" style={{ padding: '36px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                        <Calendar style={{ width: '22px', height: '22px', color: '#f472b6' }} />
                        Upcoming (72 hours)
                    </h2>
                    {(!data?.upcomingEvents || data.upcomingEvents.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Calendar style={{ width: '48px', height: '48px', color: 'var(--text-muted)', opacity: 0.2, margin: '0 auto 16px' }} />
                            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>No events in the next 3 days.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {data?.upcomingEvents.map((event) => (
                                <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderRadius: '14px', background: 'var(--bg-tertiary)' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(244, 114, 182, 0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#f472b6' }}>{event.startDate.split('-')[2]}</span>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{format(new Date(event.startDate), 'MMM')}</span>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{event.title}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{event.eventType.replace('_', ' ').toUpperCase()} {event.startTime ? `• ${event.startTime}` : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
