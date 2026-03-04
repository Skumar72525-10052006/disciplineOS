'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Plus, X, MapPin, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface ActivityItem { id: string; title: string; description: string | null; activityType: string; activityDate: string; startTime: string | null; endTime: string | null; durationMins: number | null; location: string | null; tags: string | null; notes: string | null }

const ACTIVITY_TYPES = [
    { value: 'sports', label: '🏅 Sports', color: '#f97316' },
    { value: 'club', label: '🎭 Club', color: '#a855f7' },
    { value: 'volunteer', label: '🤝 Volunteer', color: '#22c55e' },
    { value: 'competition', label: '🏆 Competition', color: '#d29922' },
    { value: 'cultural', label: '🎨 Cultural', color: '#ec4899' },
    { value: 'general', label: '⭐ General', color: '#6b7280' },
]

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '', activityType: 'general', activityDate: format(new Date(), 'yyyy-MM-dd'), startTime: '', endTime: '', durationMins: '', location: '', tags: '', notes: '' })

    const loadActivities = useCallback(async () => { try { setActivities(await (await fetch('/api/activities')).json()) } catch { } finally { setLoading(false) } }, [])
    useEffect(() => { loadActivities() }, [loadActivities])
    const deleteActivity = async (id: string) => { if (!confirm('Are you sure you want to delete this activity?')) return; try { await fetch(`/api/activities/${id}`, { method: 'DELETE' }); loadActivities() } catch { } }
    const createActivity = async (e: React.FormEvent) => {
        e.preventDefault()
        await fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, description: formData.description || null, startTime: formData.startTime || null, endTime: formData.endTime || null, durationMins: formData.durationMins ? parseInt(formData.durationMins) : null, location: formData.location || null, tags: formData.tags || null, notes: formData.notes || null }) })
        setShowForm(false); loadActivities()
    }

    const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', fontSize: '15px', fontFamily: 'inherit', background: 'var(--bg-tertiary)', border: '2px solid var(--border)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' as const }

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div style={{ width: '40px', height: '40px', border: '3px solid #22d3ee', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <Sparkles style={{ width: '28px', height: '28px', color: '#22d3ee' }} /> Activities
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>Co-curricular activities, clubs, sports, and more</p>
                </div>
                <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #06b6d4, #22d3ee)', border: 'none', cursor: 'pointer' }}>
                    <Plus style={{ width: '18px', height: '18px' }} /> Log Activity
                </button>
            </div>

            {/* Activity grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '16px' }}>
                {activities.map((act, i) => {
                    const typeConfig = ACTIVITY_TYPES.find(t => t.value === act.activityType) || ACTIVITY_TYPES[5]
                    return (
                        <motion.div key={act.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card glass-card-hover"
                            style={{ padding: '24px 28px', borderLeft: `4px solid ${typeConfig.color}` }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{act.title}</h3>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '8px', background: `${typeConfig.color}20`, color: typeConfig.color, fontWeight: 600, flexShrink: 0 }}>{typeConfig.label}</span>
                                    <button onClick={() => deleteActivity(act.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }} title="Delete Activity">
                                        <Trash2 style={{ width: '16px', height: '16px' }} />
                                    </button>
                                </div>
                            </div>
                            {act.description && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>{act.description}</p>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <span>📅 {act.activityDate}</span>
                                {act.durationMins && <span>⏱️ {act.durationMins}min</span>}
                                {act.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin style={{ width: '12px', height: '12px' }} /> {act.location}</span>}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
            {activities.length === 0 && <div className="glass-card" style={{ padding: '64px', textAlign: 'center' }}><Sparkles style={{ width: '48px', height: '48px', color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} /><p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>No activities logged yet.</p></div>}

            {/* Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '36px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Log Activity</h2>
                                <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: '22px', height: '22px' }} /></button>
                            </div>
                            <form onSubmit={createActivity} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Activity Name</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required style={inputStyle} /></div>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>Type</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{ACTIVITY_TYPES.map(t => (
                                        <button key={t.value} type="button" onClick={() => setFormData({ ...formData, activityType: t.value })} style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: formData.activityType === t.value ? `${t.color}30` : 'var(--bg-tertiary)', color: t.color, border: formData.activityType === t.value ? `2px solid ${t.color}` : '2px solid var(--border)' }}>{t.label}</button>
                                    ))}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Date</label><input type="date" value={formData.activityDate} onChange={e => setFormData({ ...formData, activityDate: e.target.value })} required style={inputStyle} /></div>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Duration (min)</label><input type="number" value={formData.durationMins} onChange={e => setFormData({ ...formData, durationMins: e.target.value })} style={inputStyle} /></div>
                                </div>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Location</label><input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="📍 Location" style={inputStyle} /></div>
                                <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #06b6d4, #22d3ee)', border: 'none', cursor: 'pointer' }}>Log Activity</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
