'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Plus, X, Clock, DollarSign, Calendar, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface WorkLog { id: string; workDate: string; startTime: string | null; endTime: string | null; hoursWorked: number; workplace: string | null; workType: string; earnings: number | null; notes: string | null }

export default function WorkPage() {
    const [logs, setLogs] = useState<WorkLog[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ workDate: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', hoursWorked: '8', workplace: '', workType: 'part_time', earnings: '', notes: '' })

    const loadLogs = useCallback(async () => { try { setLogs(await (await fetch('/api/work')).json()) } catch { } finally { setLoading(false) } }, [])
    useEffect(() => { loadLogs() }, [loadLogs])
    const deleteLog = async (id: string) => { if (!confirm('Are you sure you want to delete this work log?')) return; try { await fetch(`/api/work/${id}`, { method: 'DELETE' }); loadLogs() } catch { } }
    const createLog = async (e: React.FormEvent) => {
        e.preventDefault()
        await fetch('/api/work', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, hoursWorked: parseFloat(formData.hoursWorked), earnings: formData.earnings ? parseFloat(formData.earnings) : null, workplace: formData.workplace || null, notes: formData.notes || null }) })
        setShowForm(false); loadLogs()
    }

    const totalHours = logs.reduce((s, l) => s + l.hoursWorked, 0)
    const totalEarnings = logs.reduce((s, l) => s + (l.earnings || 0), 0)
    const thisMonthLogs = logs.filter(l => l.workDate.startsWith(format(new Date(), 'yyyy-MM')))
    const thisMonthHours = thisMonthLogs.reduce((s, l) => s + l.hoursWorked, 0)
    const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', fontSize: '15px', fontFamily: 'inherit', background: 'var(--bg-tertiary)', border: '2px solid var(--border)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' as const }

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div style={{ width: '40px', height: '40px', border: '3px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <Briefcase style={{ width: '28px', height: '28px', color: '#f97316' }} /> Work Log
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>Track your part-time work hours and earnings</p>
                </div>
                <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #f97316, #fb923c)', border: 'none', cursor: 'pointer' }}>
                    <Plus style={{ width: '18px', height: '18px' }} /> Log Work
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                {[
                    { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, icon: Clock, color: '#f97316' },
                    { label: 'Total Earned', value: `₹${totalEarnings.toLocaleString()}`, icon: DollarSign, color: '#22c55e' },
                    { label: 'This Month', value: `${thisMonthHours.toFixed(1)}h`, icon: Calendar, color: '#58a6ff' },
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon style={{ width: '24px', height: '24px', color: s.color }} />
                        </div>
                        <div>
                            <div className="font-mono-nums" style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {logs.map((log, i) => (
                    <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card glass-card-hover"
                        style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #f97316' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(249, 115, 22, 0.12)' }}>
                            <span style={{ fontSize: '18px', fontWeight: 700, color: '#f97316' }}>{log.workDate.split('-')[2]}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{format(new Date(log.workDate), 'MMM')}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{log.workplace || 'Work Session'}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{log.startTime}–{log.endTime}</span>
                                <span className="font-mono-nums" style={{ fontSize: '13px', fontWeight: 700, color: '#f97316' }}>{log.hoursWorked}h</span>
                                {log.earnings && <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>₹{log.earnings}</span>}
                            </div>
                        </div>
                        <button onClick={() => deleteLog(log.id)} style={{ padding: '8px', borderRadius: '10px', background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Delete Log">
                            <Trash2 style={{ width: '18px', height: '18px' }} />
                        </button>
                    </motion.div>
                ))}
                {logs.length === 0 && <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}><p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>No work logs yet. Log your first work session!</p></div>}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '36px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Log Work</h2>
                                <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: '22px', height: '22px' }} /></button>
                            </div>
                            <form onSubmit={createLog} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Date</label><input type="date" value={formData.workDate} onChange={e => setFormData({ ...formData, workDate: e.target.value })} required style={inputStyle} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Start</label><input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} style={inputStyle} /></div>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>End</label><input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} style={inputStyle} /></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Hours</label><input type="number" step="0.5" value={formData.hoursWorked} onChange={e => setFormData({ ...formData, hoursWorked: e.target.value })} required style={inputStyle} /></div>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Earnings ₹</label><input type="number" value={formData.earnings} onChange={e => setFormData({ ...formData, earnings: e.target.value })} style={inputStyle} /></div>
                                </div>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Workplace</label><input type="text" value={formData.workplace} onChange={e => setFormData({ ...formData, workplace: e.target.value })} style={inputStyle} /></div>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Notes</label><textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} /></div>
                                <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #f97316, #fb923c)', border: 'none', cursor: 'pointer' }}>Log Work</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
