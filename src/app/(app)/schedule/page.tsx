'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

interface Slot {
    id: string; title: string; dayOfWeek: number; scheduleDate: string | null
    startTime: string; endTime: string; slotType: string; location: string | null
}

type ViewMode = 'day' | 'week' | 'month'

const TYPE_COLORS: Record<string, string> = {
    class: '#58a6ff', study: '#a855f7', work: '#f97316', activity: '#39d353', break: '#6e7681'
}
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 64
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function localDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function addDays(dateStr: string, n: number) {
    const d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() + n)
    return localDateStr(d)
}
function timeToMinutes(time: string) {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + (m || 0)
}
function getWeekDates(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    const dayOfWeek = d.getDay()
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7))
    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(monday)
        day.setDate(monday.getDate() + i)
        return localDateStr(day)
    })
}
function getMonthGrid(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    const year = d.getFullYear(), month = d.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = (firstDay.getDay() + 6) % 7 // Monday-based
    const days: (string | null)[] = []
    for (let i = 0; i < startPad; i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`)
    }
    return days
}

export default function SchedulePage() {
    const [selectedDate, setSelectedDate] = useState(localDateStr(new Date()))
    const [viewMode, setViewMode] = useState<ViewMode>('day')
    const [slots, setSlots] = useState<Slot[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        title: '', scheduleDate: localDateStr(new Date()),
        startTime: '09:00', endTime: '10:00', slotType: 'class', location: ''
    })
    const scrollRef = useRef<HTMLDivElement>(null)

    const loadSlots = useCallback(async () => {
        setLoading(true)
        try {
            let url = '/api/schedule'
            if (viewMode === 'day') {
                url += `?date=${selectedDate}`
            } else if (viewMode === 'week') {
                const week = getWeekDates(selectedDate)
                url += `?from=${week[0]}&to=${week[6]}`
            } else {
                const d = new Date(selectedDate + 'T00:00:00')
                const first = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
                const last = localDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0))
                url += `?from=${first}&to=${last}`
            }
            const r = await fetch(url)
            setSlots(await r.json())
        } catch { } finally { setLoading(false) }
    }, [selectedDate, viewMode])

    useEffect(() => { loadSlots() }, [loadSlots])

    // Auto-scroll to current time on day view
    useEffect(() => {
        if (viewMode === 'day' && scrollRef.current && !loading) {
            const now = new Date()
            const scrollTo = Math.max((now.getHours() - 1) * HOUR_HEIGHT, 0)
            scrollRef.current.scrollTop = scrollTo
        }
    }, [viewMode, loading, selectedDate])

    const createSlot = async (e: React.FormEvent) => {
        e.preventDefault()
        await fetch('/api/schedule', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, location: formData.location || null })
        })
        setShowForm(false)
        setFormData({ title: '', scheduleDate: selectedDate, startTime: '09:00', endTime: '10:00', slotType: 'class', location: '' })
        loadSlots()
    }

    const deleteSlot = async (id: string) => {
        if (!confirm('Delete this slot?')) return
        await fetch(`/api/schedule/${id}`, { method: 'DELETE' })
        loadSlots()
    }

    const navigate = (dir: number) => {
        if (viewMode === 'day') setSelectedDate(addDays(selectedDate, dir))
        else if (viewMode === 'week') setSelectedDate(addDays(selectedDate, dir * 7))
        else {
            const d = new Date(selectedDate + 'T00:00:00')
            d.setMonth(d.getMonth() + dir)
            setSelectedDate(localDateStr(d))
        }
    }

    const todayStr = localDateStr(new Date())
    const isToday = selectedDate === todayStr
    const selDate = new Date(selectedDate + 'T00:00:00')
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const headerLabel = viewMode === 'day'
        ? `${DAY_NAMES_FULL[selDate.getDay()]} • ${selDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : viewMode === 'week'
            ? (() => { const w = getWeekDates(selectedDate); const s = new Date(w[0] + 'T00:00:00'); const e = new Date(w[6] + 'T00:00:00'); return `${s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` })()
            : `${MONTH_NAMES[selDate.getMonth()]} ${selDate.getFullYear()}`

    const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', fontSize: '15px', fontFamily: 'inherit', background: 'var(--bg-tertiary)', border: '2px solid var(--border)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' as const }

    // ── Render Day View ──────────────────────────────
    const renderDayView = () => (
        <div ref={scrollRef} className="glass-card" style={{ padding: '0', position: 'relative' }}>
            <div style={{ position: 'relative', height: `${24 * HOUR_HEIGHT}px` }}>
                {/* Hour grid */}
                {HOURS.map(hour => (
                    <div key={hour} style={{ position: 'absolute', top: `${hour * HOUR_HEIGHT}px`, left: 0, right: 0, height: `${HOUR_HEIGHT}px`, display: 'flex', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: '70px', padding: '4px 8px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }} className="font-mono-nums">
                            {String(hour).padStart(2, '0')}:00
                        </div>
                        <div style={{ flex: 1, borderLeft: '1px solid var(--border)' }} />
                    </div>
                ))}

                {/* Event blocks */}
                {slots.map(slot => {
                    const startMin = timeToMinutes(slot.startTime)
                    const endMin = timeToMinutes(slot.endTime)
                    const durationMin = Math.max(endMin - startMin, 15)
                    const topPx = (startMin / 60) * HOUR_HEIGHT
                    const heightPx = (durationMin / 60) * HOUR_HEIGHT
                    const color = TYPE_COLORS[slot.slotType] || '#6e7681'
                    return (
                        <motion.div key={slot.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            style={{ position: 'absolute', top: `${topPx}px`, left: '78px', right: '8px', height: `${heightPx}px`, padding: heightPx > 30 ? '8px 12px' : '4px 12px', borderRadius: '8px', background: `${color}22`, borderLeft: `4px solid ${color}`, overflow: 'hidden', zIndex: 5, cursor: 'default', transition: 'box-shadow 0.2s', boxShadow: `0 1px 4px ${color}15` }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${color}35`; e.currentTarget.style.background = `${color}30` }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 1px 4px ${color}15`; e.currentTarget.style.background = `${color}22` }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: '100%' }}>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slot.title}</div>
                                    {heightPx > 35 && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{slot.startTime} — {slot.endTime}{slot.location && ` • ${slot.location}`}</div>}
                                </div>
                                <button onClick={() => deleteSlot(slot.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', opacity: 0.4, flexShrink: 0 }} title="Delete">
                                    <Trash2 style={{ width: '13px', height: '13px' }} />
                                </button>
                            </div>
                        </motion.div>
                    )
                })}

                {/* Current time line */}
                {isToday && (
                    <div style={{ position: 'absolute', left: '70px', right: 0, top: `${(currentMinutes / 60) * HOUR_HEIGHT}px`, height: '2px', background: '#f85149', zIndex: 15, boxShadow: '0 0 8px rgba(248,81,73,0.5)' }}>
                        <div style={{ position: 'absolute', left: '-5px', top: '-5px', width: '12px', height: '12px', borderRadius: '50%', background: '#f85149' }} />
                    </div>
                )}
            </div>
        </div>
    )

    // ── Render Week View ─────────────────────────────
    const weekDates = getWeekDates(selectedDate)
    const renderWeekView = () => (
        <div className="glass-card" style={{ padding: '0' }}>
            {/* Week header */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '2px solid var(--border)', position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg-secondary)' }}>
                <div style={{ padding: '10px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }} />
                {weekDates.map((dateStr, i) => {
                    const d = new Date(dateStr + 'T00:00:00')
                    const isTodayCol = dateStr === todayStr
                    return (
                        <div key={dateStr} onClick={() => { setSelectedDate(dateStr); setViewMode('day') }}
                            style={{ padding: '10px 4px', textAlign: 'center', cursor: 'pointer', borderLeft: '1px solid var(--border)', background: isTodayCol ? 'rgba(210,153,34,0.08)' : 'transparent' }}>
                            <div style={{ fontSize: '11px', color: isTodayCol ? '#d29922' : 'var(--text-muted)', fontWeight: 600 }}>{DAY_NAMES_SHORT[(i + 1) % 7]}</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: isTodayCol ? '#d29922' : 'var(--text-primary)', marginTop: '2px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2px auto 0', background: isTodayCol ? '#d2992220' : 'transparent' }}>
                                {d.getDate()}
                            </div>
                        </div>
                    )
                })}
            </div>
            {/* Week body */}
            <div style={{ position: 'relative', height: `${24 * HOUR_HEIGHT}px` }}>
                {HOURS.map(hour => (
                    <div key={hour} style={{ position: 'absolute', top: `${hour * HOUR_HEIGHT}px`, left: 0, right: 0, height: `${HOUR_HEIGHT}px`, display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ padding: '2px 4px', textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)' }} className="font-mono-nums">{String(hour).padStart(2, '0')}:00</div>
                        {weekDates.map(dateStr => (
                            <div key={dateStr} style={{ borderLeft: '1px solid var(--border)', background: dateStr === todayStr ? 'rgba(210,153,34,0.03)' : 'transparent' }} />
                        ))}
                    </div>
                ))}
                {/* Events for each day */}
                {weekDates.map((dateStr, colIdx) => {
                    const daySlotsArr = slots.filter(s => s.scheduleDate === dateStr)
                    const colLeft = `calc(60px + ${colIdx} * ((100% - 60px) / 7))`
                    const colWidth = `calc((100% - 60px) / 7 - 4px)`
                    return daySlotsArr.map(slot => {
                        const startMin = timeToMinutes(slot.startTime)
                        const endMin = timeToMinutes(slot.endTime)
                        const durationMin = Math.max(endMin - startMin, 15)
                        const topPx = (startMin / 60) * HOUR_HEIGHT
                        const heightPx = (durationMin / 60) * HOUR_HEIGHT
                        const color = TYPE_COLORS[slot.slotType] || '#6e7681'
                        return (
                            <div key={slot.id} style={{ position: 'absolute', top: `${topPx + 1}px`, left: colLeft, width: colWidth, height: `${heightPx - 2}px`, padding: '3px 6px', borderRadius: '6px', background: `${color}25`, borderLeft: `3px solid ${color}`, overflow: 'hidden', zIndex: 5, fontSize: '11px', cursor: 'pointer' }}
                                onClick={() => { setSelectedDate(dateStr); setViewMode('day') }}
                                title={`${slot.title}\n${slot.startTime} — ${slot.endTime}`}>
                                <div style={{ fontWeight: 700, color: color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slot.title}</div>
                                {heightPx > 28 && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{slot.startTime}</div>}
                            </div>
                        )
                    })
                })}
                {/* Current time line */}
                {weekDates.includes(todayStr) && (
                    <div style={{ position: 'absolute', left: '60px', right: 0, top: `${(currentMinutes / 60) * HOUR_HEIGHT}px`, height: '2px', background: '#f85149', zIndex: 15, boxShadow: '0 0 6px rgba(248,81,73,0.4)' }}>
                        <div style={{ position: 'absolute', left: '-4px', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: '#f85149' }} />
                    </div>
                )}
            </div>
        </div>
    )

    // ── Render Month View ────────────────────────────
    const monthGrid = getMonthGrid(selectedDate)
    const renderMonthView = () => (
        <div className="glass-card" style={{ padding: '20px' }}>
            {/* Day names header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', padding: '8px' }}>{d}</div>
                ))}
            </div>
            {/* Month grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {monthGrid.map((dateStr, i) => {
                    if (!dateStr) return <div key={`empty-${i}`} />
                    const d = new Date(dateStr + 'T00:00:00')
                    const isTodayCell = dateStr === todayStr
                    const daySlots = slots.filter(s => s.scheduleDate === dateStr)
                    return (
                        <div key={dateStr} onClick={() => { setSelectedDate(dateStr); setViewMode('day') }}
                            style={{ padding: '8px', borderRadius: '10px', minHeight: '80px', cursor: 'pointer', background: isTodayCell ? 'rgba(210,153,34,0.1)' : 'var(--bg-tertiary)', border: isTodayCell ? '2px solid #d29922' : '1px solid var(--border)', transition: 'background 0.2s' }}>
                            <div style={{ fontSize: '14px', fontWeight: isTodayCell ? 800 : 600, color: isTodayCell ? '#d29922' : 'var(--text-primary)', marginBottom: '6px' }}>
                                {d.getDate()}
                            </div>
                            {daySlots.slice(0, 3).map(slot => (
                                <div key={slot.id} style={{ fontSize: '10px', fontWeight: 600, color: TYPE_COLORS[slot.slotType] || '#6e7681', padding: '2px 4px', borderRadius: '4px', background: `${TYPE_COLORS[slot.slotType] || '#6e7681'}15`, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {slot.title}
                                </div>
                            ))}
                            {daySlots.length > 3 && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{daySlots.length - 3} more</div>}
                        </div>
                    )
                })}
            </div>
        </div>
    )

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <Calendar style={{ width: '28px', height: '28px', color: '#d29922' }} /> Schedule
                    </h1>
                </div>
                <button onClick={() => { setFormData({ ...formData, scheduleDate: selectedDate }); setShowForm(true) }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #d29922, #f59e0b)', border: 'none', cursor: 'pointer' }}>
                    <Plus style={{ width: '18px', height: '18px' }} /> Add Slot
                </button>
            </div>

            {/* View Mode Toggle + Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                {/* View mode buttons */}
                <div style={{ display: 'flex', gap: '4px', borderRadius: '12px', background: 'var(--bg-tertiary)', padding: '4px' }}>
                    {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
                        <button key={mode} onClick={() => setViewMode(mode)}
                            style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', border: 'none', background: viewMode === mode ? '#d29922' : 'transparent', color: viewMode === mode ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                            {mode}
                        </button>
                    ))}
                </div>

                {/* Date navigation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}>
                        <ChevronLeft style={{ width: '18px', height: '18px' }} />
                    </button>
                    {!isToday && (
                        <button onClick={() => setSelectedDate(todayStr)} style={{ background: '#d2992215', border: '1px solid #d2992250', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', color: '#d29922', fontSize: '13px', fontWeight: 600 }}>
                            Today
                        </button>
                    )}
                    <button onClick={() => navigate(1)} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}>
                        <ChevronRight style={{ width: '18px', height: '18px' }} />
                    </button>
                </div>

                {/* Date label */}
                <div style={{ fontSize: '15px', fontWeight: 700, color: isToday ? '#d29922' : 'var(--text-primary)', minWidth: '240px', textAlign: 'right' }}>
                    {headerLabel}
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                {Object.entries(TYPE_COLORS).map(([type, color]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{type}</span>
                    </div>
                ))}
            </div>

            {/* Main content */}
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #d29922', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
            ) : (
                <>
                    {viewMode === 'day' && renderDayView()}
                    {viewMode === 'week' && renderWeekView()}
                    {viewMode === 'month' && renderMonthView()}
                </>
            )}

            {/* Empty state for day view */}
            {!loading && viewMode === 'day' && slots.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    <Calendar style={{ width: '36px', height: '36px', opacity: 0.3, marginBottom: '10px' }} />
                    <p style={{ fontSize: '14px', margin: '0 0 4px' }}>No slots for this day</p>
                    <p style={{ fontSize: '12px', opacity: 0.6, margin: 0 }}>Click "Add Slot" to schedule an activity</p>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '36px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Add Schedule Slot</h2>
                                <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: '22px', height: '22px' }} /></button>
                            </div>
                            <form onSubmit={createSlot} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Title</label>
                                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required style={inputStyle} placeholder="e.g. Math Class, Gym Session" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Date</label>
                                    <input type="date" value={formData.scheduleDate} onChange={e => setFormData({ ...formData, scheduleDate: e.target.value })} required style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Start Time</label>
                                        <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>End Time</label>
                                        <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} style={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>Type</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {Object.keys(TYPE_COLORS).map(t => (
                                            <button key={t} type="button" onClick={() => setFormData({ ...formData, slotType: t })} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', background: formData.slotType === t ? `${TYPE_COLORS[t]}25` : 'var(--bg-tertiary)', color: TYPE_COLORS[t], border: formData.slotType === t ? `2px solid ${TYPE_COLORS[t]}` : '2px solid var(--border)' }}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Location</label>
                                    <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Optional" style={inputStyle} />
                                </div>
                                <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #d29922, #f59e0b)', border: 'none', cursor: 'pointer' }}>Add Slot</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
