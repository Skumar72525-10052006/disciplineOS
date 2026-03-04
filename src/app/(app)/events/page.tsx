'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Plus, X, MapPin, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface EventItem { id: string; title: string; description: string | null; eventType: string; startDate: string; startTime: string | null; endDate: string | null; endTime: string | null; allDay: boolean; location: string | null; tags: string | null; notes: string | null }

const EVENT_TYPES = [
    { value: 'tech_event', label: '💻 Tech Event', color: '#6366f1' },
    { value: 'hackathon', label: '🚀 Hackathon', color: '#f97316' },
    { value: 'workshop', label: '🛠️ Workshop', color: '#22c55e' },
    { value: 'exam', label: '📝 Exam', color: '#f85149' },
    { value: 'assignment', label: '📋 Assignment', color: '#d29922' },
    { value: 'presentation', label: '🎤 Presentation', color: '#a855f7' },
    { value: 'holiday', label: '🎉 Holiday', color: '#22d3ee' },
    { value: 'general', label: '📌 General', color: '#6b7280' },
]

export default function EventsPage() {
    const [events, setEvents] = useState<EventItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [filter, setFilter] = useState('all')
    const [formData, setFormData] = useState({ title: '', description: '', eventType: 'general', startDate: format(new Date(), 'yyyy-MM-dd'), startTime: '', endDate: '', endTime: '', allDay: false, location: '', tags: '', notes: '' })

    const loadEvents = useCallback(async () => { try { setEvents(await (await fetch('/api/events')).json()) } catch { } finally { setLoading(false) } }, [])
    useEffect(() => { loadEvents() }, [loadEvents])
    const deleteEvent = async (id: string) => { if (!confirm('Are you sure you want to delete this event?')) return; try { await fetch(`/api/events/${id}`, { method: 'DELETE' }); loadEvents() } catch { } }
    const createEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, description: formData.description || null, startTime: formData.startTime || null, endDate: formData.endDate || null, endTime: formData.endTime || null, location: formData.location || null, tags: formData.tags || null, notes: formData.notes || null }) })
        setShowForm(false); loadEvents()
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const filtered = events.filter(e => filter === 'all' || e.eventType === filter)
    const upcoming = events.filter(e => e.startDate >= todayStr).length
    const techEvents = events.filter(e => ['tech_event', 'hackathon', 'workshop'].includes(e.eventType)).length
    const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', fontSize: '15px', fontFamily: 'inherit', background: 'var(--bg-tertiary)', border: '2px solid var(--border)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' as const }

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div style={{ width: '40px', height: '40px', border: '3px solid #f472b6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <CalendarDays style={{ width: '28px', height: '28px', color: '#f472b6' }} /> Events
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>Tech events, exams, deadlines, and more</p>
                </div>
                <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #ec4899, #f472b6)', border: 'none', cursor: 'pointer' }}>
                    <Plus style={{ width: '18px', height: '18px' }} /> Add Event
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Events', value: events.length, color: 'var(--text-primary)' },
                    { label: 'Upcoming', value: upcoming, color: '#f472b6' },
                    { label: 'Tech Events', value: techEvents, color: '#6366f1' },
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                        <div className="font-mono-nums" style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button onClick={() => setFilter('all')} style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: filter === 'all' ? 'var(--bg-tertiary)' : 'transparent', color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)', border: filter === 'all' ? '1px solid var(--border-light)' : '1px solid transparent' }}>All</button>
                {EVENT_TYPES.map(t => (
                    <button key={t.value} onClick={() => setFilter(t.value)} style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: filter === t.value ? `${t.color}20` : 'transparent', color: filter === t.value ? t.color : 'var(--text-muted)', border: filter === t.value ? `1px solid ${t.color}` : '1px solid transparent' }}>{t.label}</button>
                ))}
            </div>

            {/* Events List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filtered.map((event, i) => {
                    const typeConfig = EVENT_TYPES.find(t => t.value === event.eventType) || EVENT_TYPES[7]
                    const isPast = event.startDate < todayStr
                    return (
                        <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card glass-card-hover"
                            style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: `4px solid ${typeConfig.color}`, opacity: isPast ? 0.6 : 1 }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `${typeConfig.color}15` }}>
                                <span style={{ fontSize: '18px', fontWeight: 700, color: typeConfig.color }}>{event.startDate.split('-')[2]}</span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{format(new Date(event.startDate), 'MMM')}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '8px', background: `${typeConfig.color}20`, color: typeConfig.color, fontWeight: 600 }}>{typeConfig.label}</span>
                                    {event.startTime && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⏰ {event.startTime}</span>}
                                    {event.location && <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin style={{ width: '12px', height: '12px' }} />{event.location}</span>}
                                </div>
                            </div>
                            <button onClick={() => deleteEvent(event.id)} style={{ padding: '8px', borderRadius: '10px', background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Delete Event">
                                <Trash2 style={{ width: '18px', height: '18px' }} />
                            </button>
                        </motion.div>
                    )
                })}
                {filtered.length === 0 && <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}><p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>No events found.</p></div>}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '36px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>New Event</h2>
                                <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: '22px', height: '22px' }} /></button>
                            </div>
                            <form onSubmit={createEvent} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Title</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required style={inputStyle} /></div>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>Type</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{EVENT_TYPES.map(t => (
                                        <button key={t.value} type="button" onClick={() => setFormData({ ...formData, eventType: t.value })} style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: formData.eventType === t.value ? `${t.color}30` : 'var(--bg-tertiary)', color: t.color, border: formData.eventType === t.value ? `2px solid ${t.color}` : '2px solid var(--border)' }}>{t.label}</button>
                                    ))}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Start Date</label><input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required style={inputStyle} /></div>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>End Date</label><input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} style={inputStyle} /></div>
                                </div>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Location</label><input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="📍 Location" style={inputStyle} /></div>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Tags</label><input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="AI, coding, networking" style={inputStyle} /></div>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Notes</label><textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} /></div>
                                <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #ec4899, #f472b6)', border: 'none', cursor: 'pointer' }}>Create Event</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
