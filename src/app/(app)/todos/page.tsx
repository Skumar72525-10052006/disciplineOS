'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ListTodo, Plus, X, CheckCircle2, Circle, Clock, AlertTriangle, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface Task { id: string; title: string; description: string; priority: string; status: string; dueDate: string | null; estimatedMinutes: number | null }

export default function TodosPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', dueDate: '', estimatedMinutes: 30 })

    useEffect(() => { loadTasks() }, [])
    const loadTasks = async () => { try { const r = await fetch('/api/todos'); setTasks(await r.json()) } catch { } finally { setLoading(false) } }
    const createTask = async (e: React.FormEvent) => { e.preventDefault(); await fetch('/api/todos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, dueDate: formData.dueDate || null }) }); setShowForm(false); setFormData({ title: '', description: '', priority: 'medium', dueDate: '', estimatedMinutes: 30 }); loadTasks() }
    const toggleTask = async (id: string, status: string) => { await fetch(`/api/todos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: status === 'completed' ? 'pending' : 'completed' }) }); loadTasks() }
    const deleteTask = async (id: string) => { await fetch(`/api/todos/${id}`, { method: 'DELETE' }); loadTasks() }

    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const filtered = tasks.filter(t => {
        if (filter === 'pending') return t.status !== 'completed'
        if (filter === 'done') return t.status === 'completed'
        if (filter === 'overdue') return t.dueDate && t.dueDate < todayStr && t.status !== 'completed'
        return true
    })
    const pending = tasks.filter(t => t.status !== 'completed').length
    const completed = tasks.filter(t => t.status === 'completed').length
    const overdue = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'completed').length
    const priorityColors: Record<string, string> = { urgent: '#f85149', high: '#f97316', medium: '#d29922', low: '#58a6ff' }

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div style={{ width: '40px', height: '40px', border: '3px solid #58a6ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>

    const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', fontSize: '15px', fontFamily: 'inherit', background: 'var(--bg-tertiary)', border: '2px solid var(--border)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' as const }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <ListTodo style={{ width: '28px', height: '28px', color: '#58a6ff' }} /> Tasks
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>Manage your tasks with priority levels</p>
                </div>
                <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #3b82f6, #58a6ff)', border: 'none', cursor: 'pointer' }}>
                    <Plus style={{ width: '18px', height: '18px' }} /> Add Task
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                {[
                    { label: 'Pending', value: pending, icon: Clock, color: '#58a6ff' },
                    { label: 'Completed', value: completed, icon: CheckCircle2, color: '#39d353' },
                    { label: 'Overdue', value: overdue, icon: AlertTriangle, color: '#f85149' },
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon style={{ width: '24px', height: '24px', color: s.color }} />
                        </div>
                        <div>
                            <div className="font-mono-nums" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['all', 'pending', 'done', 'overdue'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', background: filter === f ? 'var(--bg-tertiary)' : 'transparent', color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)', border: filter === f ? '1px solid var(--border-light)' : '1px solid transparent', textTransform: 'capitalize' }}>{f}</button>
                ))}
            </div>

            {/* Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filtered.map(task => (
                    <motion.div key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card"
                        style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: `4px solid ${priorityColors[task.priority] || '#d29922'}` }}>
                        <button onClick={() => toggleTask(task.id, task.status)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                            {task.status === 'completed' ? <CheckCircle2 style={{ width: '24px', height: '24px', color: '#39d353' }} /> : <Circle style={{ width: '24px', height: '24px', color: 'var(--text-muted)' }} />}
                        </button>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'completed' ? 'line-through' : 'none', margin: 0 }}>{task.title}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                                <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '8px', background: `${priorityColors[task.priority]}20`, color: priorityColors[task.priority], fontWeight: 600 }}>{task.priority}</span>
                                {task.dueDate && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due: {task.dueDate}</span>}
                                {task.estimatedMinutes && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>~{task.estimatedMinutes}min</span>}
                            </div>
                        </div>
                        <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                            <Trash2 style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                        </button>
                    </motion.div>
                ))}
                {filtered.length === 0 && (
                    <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>No tasks yet. Add your first one!</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '36px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Add Task</h2>
                                <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: '22px', height: '22px' }} /></button>
                            </div>
                            <form onSubmit={createTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Title</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required style={inputStyle} /></div>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Description</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} /></div>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>Priority</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>{['low', 'medium', 'high', 'urgent'].map(p => (
                                        <button key={p} type="button" onClick={() => setFormData({ ...formData, priority: p })} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: formData.priority === p ? `${priorityColors[p]}25` : 'var(--bg-tertiary)', color: priorityColors[p], border: formData.priority === p ? `2px solid ${priorityColors[p]}` : '2px solid var(--border)', textTransform: 'capitalize' }}>{p}</button>
                                    ))}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Due Date</label><input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} style={inputStyle} /></div>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Est. Minutes</label><input type="number" value={formData.estimatedMinutes} onChange={e => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })} style={inputStyle} /></div>
                                </div>
                                <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #3b82f6, #58a6ff)', border: 'none', cursor: 'pointer' }}>Add Task</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
