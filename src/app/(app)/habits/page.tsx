'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Plus, ChevronLeft, ChevronRight, X, Flame, TrendingUp } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths } from 'date-fns'

interface Habit {
    id: string; name: string; icon: string; color: string; category: string
    targetDays: string; isChain: boolean
    logs: Array<{ logDate: string; status: string }>
}

const CATEGORIES = [
    { value: 'general', label: 'General', color: '#6366f1' },
    { value: 'health', label: 'Health', color: '#22c55e' },
    { value: 'study', label: 'Study', color: '#3b82f6' },
    { value: 'fitness', label: 'Fitness', color: '#f97316' },
    { value: 'mindset', label: 'Mindset', color: '#a855f7' },
]
const ICONS = ['⭐', '📚', '💪', '🧘', '💧', '🏃', '✍️', '🎯', '🧠', '💤', '🍎', '📖', '⏰', '🎵', '💻']

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ name: '', icon: '⭐', color: '#6366f1', category: 'general', targetDays: '1,2,3,4,5,6,7', isChain: false })
    const [selectedHabit, setSelectedHabit] = useState<string | null>(null)

    const loadHabits = useCallback(async () => {
        try {
            const res = await fetch('/api/habits')
            const data = await res.json()
            setHabits(data)
            if (data.length > 0 && !selectedHabit) setSelectedHabit(data[0].id)
        } catch { /* empty */ } finally { setLoading(false) }
    }, [selectedHabit])

    useEffect(() => { loadHabits() }, [loadHabits])

    const toggleHabit = async (habitId: string) => {
        await fetch(`/api/habits/${habitId}/complete`, { method: 'POST' })
        loadHabits()
    }
    const createHabit = async (e: React.FormEvent) => {
        e.preventDefault()
        await fetch('/api/habits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
        setShowForm(false)
        setFormData({ name: '', icon: '⭐', color: '#6366f1', category: 'general', targetDays: '1,2,3,4,5,6,7', isChain: false })
        loadHabits()
    }
    const deleteHabit = async (id: string) => {
        await fetch(`/api/habits/${id}`, { method: 'DELETE' })
        setSelectedHabit(null)
        loadHabits()
    }

    const activeHabit = habits.find(h => h.id === selectedHabit)
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const startDayOfWeek = getDay(monthStart)
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const completedDates = new Set(activeHabit?.logs?.map(l => l.logDate) || [])
    const targetDaysSet = new Set(activeHabit?.targetDays.split(',').map(Number) || [])
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const totalScheduled = monthDays.filter(d => targetDaysSet.has(d.getDay() || 7) && d <= today).length
    const totalCompleted = monthDays.filter(d => completedDates.has(format(d, 'yyyy-MM-dd')) && d <= today).length
    const missedCount = monthDays.filter(d => {
        const isPast = d < today && format(d, 'yyyy-MM-dd') !== todayStr
        return isPast && targetDaysSet.has(d.getDay() || 7) && !completedDates.has(format(d, 'yyyy-MM-dd'))
    }).length
    const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0

    let currentStreak = 0
    const sortedLogs = [...(activeHabit?.logs || [])].sort((a, b) => b.logDate.localeCompare(a.logDate))
    for (const log of sortedLogs) {
        const diff = Math.abs((new Date(todayStr).getTime() - new Date(log.logDate).getTime()) / 86400000)
        if (diff <= currentStreak + 1) currentStreak++
        else break
    }

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div style={{ width: '40px', height: '40px', border: '3px solid #39d353', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>

    const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', fontSize: '15px', fontFamily: 'inherit', background: 'var(--bg-tertiary)', border: '2px solid var(--border)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' as const }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <CheckSquare style={{ width: '28px', height: '28px', color: '#39d353' }} /> Habits
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>Track your daily habits with Emily-style monthly grid</p>
                </div>
                <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #22c55e, #39d353)', border: 'none', cursor: 'pointer' }}>
                    <Plus style={{ width: '18px', height: '18px' }} /> New Habit
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
                {/* Habits List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {habits.map(habit => (
                        <motion.button key={habit.id} onClick={() => setSelectedHabit(habit.id)} whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%', textAlign: 'left', padding: '16px 18px', borderRadius: '14px', cursor: 'pointer', border: selectedHabit === habit.id ? `2px solid ${habit.color}60` : '2px solid var(--border)',
                                background: selectedHabit === habit.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', transition: 'all 0.2s',
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '24px' }}>{habit.icon}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{habit.name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, marginTop: '3px' }}>{habit.category}</p>
                                </div>
                                {habit.isChain && <Flame style={{ width: '16px', height: '16px', color: '#f97316' }} />}
                            </div>
                        </motion.button>
                    ))}
                    {habits.length === 0 && (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No habits yet. Create your first one!</p>
                        </div>
                    )}
                </div>

                {/* Monthly Grid */}
                <div>
                    {activeHabit ? (
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <span style={{ fontSize: '32px' }}>{activeHabit.icon}</span>
                                    <div>
                                        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{activeHabit.name}</h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                                            <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: `${activeHabit.color}20`, color: activeHabit.color, fontWeight: 600 }}>{activeHabit.category}</span>
                                            <span style={{ fontSize: '13px', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Flame style={{ width: '14px', height: '14px' }} /> {currentStreak} day streak
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer' }}>
                                        <ChevronLeft style={{ width: '18px', height: '18px', color: 'var(--text-secondary)' }} />
                                    </button>
                                    <span style={{ fontSize: '15px', fontWeight: 600, minWidth: '140px', textAlign: 'center', color: 'var(--text-primary)' }}>{format(currentMonth, 'MMMM yyyy')}</span>
                                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer' }}>
                                        <ChevronRight style={{ width: '18px', height: '18px', color: 'var(--text-secondary)' }} />
                                    </button>
                                </div>
                            </div>

                            {/* Stats Bar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '16px 20px', borderRadius: '14px', background: 'var(--bg-tertiary)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Completion Rate</span>
                                        <span className="font-mono-nums" style={{ fontSize: '14px', fontWeight: 700, color: completionRate >= 80 ? '#39d353' : completionRate >= 50 ? '#d29922' : '#f85149' }}>{completionRate}%</span>
                                    </div>
                                    <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-primary)' }}>
                                        <motion.div style={{ height: '100%', borderRadius: '4px', background: completionRate >= 80 ? '#39d353' : completionRate >= 50 ? '#d29922' : '#f85149' }}
                                            initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} transition={{ duration: 0.8 }} />
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '0 16px', borderLeft: '1px solid var(--border)' }}>
                                    <div className="font-mono-nums" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{totalCompleted}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>done</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '0 16px', borderLeft: '1px solid var(--border)' }}>
                                    <div className="font-mono-nums" style={{ fontSize: '22px', fontWeight: 700, color: missedCount > 0 ? '#f85149' : 'var(--text-primary)' }}>{missedCount}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>missed</div>
                                </div>
                            </div>

                            {/* Calendar */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, padding: '8px 0', color: 'var(--text-muted)' }}>{day}</div>
                                ))}
                                {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
                                {monthDays.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd')
                                    const dayNum = day.getDay() || 7
                                    const isTarget = targetDaysSet.has(dayNum)
                                    const isDone = completedDates.has(dateStr)
                                    const isToday = dateStr === todayStr
                                    const isPast = day < new Date() && !isToday
                                    return (
                                        <motion.button key={dateStr} onClick={() => isTarget && isToday && toggleHabit(activeHabit.id)} whileTap={isTarget && isToday ? { scale: 0.9 } : {}}
                                            title={isPast && !isDone && isTarget ? 'Missed — cannot complete past dates' : isPast && isDone ? 'Completed' : isToday && isTarget ? 'Click to toggle' : ''}
                                            style={{
                                                aspectRatio: '1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '14px', fontWeight: 600, cursor: isTarget && isToday ? 'pointer' : 'default', border: isToday ? '2px solid var(--accent-purple)' : '2px solid transparent',
                                                background: isDone ? '#39d353' : (isTarget && isPast) ? 'rgba(248, 81, 73, 0.25)' : 'var(--bg-tertiary)',
                                                color: isDone ? '#fff' : isTarget ? 'var(--text-primary)' : 'var(--text-muted)', opacity: isTarget ? 1 : 0.3, transition: 'all 0.2s', position: 'relative',
                                            }}>
                                            {format(day, 'd')}
                                            {isDone && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', color: '#39d353', fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</motion.div>}
                                            {isPast && !isDone && isTarget && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', borderRadius: '50%', background: '#f85149', color: '#fff', fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✗</motion.div>}
                                        </motion.button>
                                    )
                                })}
                            </div>

                            <div style={{ marginTop: '24px', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)' }}>
                                <button onClick={() => deleteHabit(activeHabit.id)} style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '10px', color: '#f85149', background: 'rgba(248, 81, 73, 0.1)', border: 'none', cursor: 'pointer' }}>Delete Habit</button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: '64px', textAlign: 'center' }}>
                            <TrendingUp style={{ width: '48px', height: '48px', color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
                            <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Select a habit to see its monthly grid, or create a new one.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                        onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '36px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>New Habit</h2>
                                <button onClick={() => setShowForm(false)} style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: '22px', height: '22px' }} /></button>
                            </div>
                            <form onSubmit={createHabit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Habit Name</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Morning Meditation" required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>Icon</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {ICONS.map(icon => (
                                            <button key={icon} type="button" onClick={() => setFormData({ ...formData, icon })}
                                                style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer', background: formData.icon === icon ? '#a855f7' : 'var(--bg-tertiary)', border: formData.icon === icon ? '2px solid #a855f7' : '2px solid var(--border)' }}>{icon}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>Category</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {CATEGORIES.map(cat => (
                                            <button key={cat.value} type="button" onClick={() => setFormData({ ...formData, category: cat.value, color: cat.color })}
                                                style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: formData.category === cat.value ? `${cat.color}30` : 'var(--bg-tertiary)', color: cat.color, border: formData.category === cat.value ? `2px solid ${cat.color}` : '2px solid var(--border)' }}>{cat.label}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: formData.isChain ? 'rgba(249, 115, 22, 0.1)' : 'var(--bg-tertiary)', border: formData.isChain ? '2px solid rgba(249, 115, 22, 0.3)' : '2px solid var(--border)', transition: 'all 0.2s' }}>
                                    <input type="checkbox" checked={formData.isChain} onChange={e => setFormData({ ...formData, isChain: e.target.checked })} style={{ width: '18px', height: '18px', marginTop: '2px' }} />
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: 600, color: formData.isChain ? '#f97316' : 'var(--text-secondary)', cursor: 'pointer' }}>🔥 Make this &quot;The Chain&quot; habit</label>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>Streak-focused mode: every day you complete builds the chain. Miss a day and the chain breaks — shown as red. Goal: never break the chain!</div>
                                    </div>
                                </div>
                                <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #22c55e, #39d353)', border: 'none', cursor: 'pointer' }}>Create Habit</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
