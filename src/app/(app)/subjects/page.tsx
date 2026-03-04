'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, X, Trophy, Trash2, Clock } from 'lucide-react'

interface Subject {
    id: string;
    name: string;
    code: string;
    color: string;
    semester: number;
    xp: number;
    level: number;
    targetHoursPerWeek: number;
    goalGrade: string;
    totalMinutes: number;
}

const LEVEL_TITLES = ['Novice', 'Apprentice', 'Scholar', 'Expert', 'Master', 'Grandmaster', 'Legend', 'Mythic']
const XP_PER_LEVEL = 500

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showManualLog, setShowManualLog] = useState(false)
    const [selectedSubForLog, setSelectedSubForLog] = useState<Subject | null>(null)
    const [manualMinutes, setManualMinutes] = useState(60)

    const [formData, setFormData] = useState({ name: '', code: '', color: '#6366f1', semester: 1, targetHoursPerWeek: 5, goalGrade: 'A' })

    useEffect(() => { loadSubjects() }, [])
    const loadSubjects = async () => { try { const r = await fetch('/api/subjects'); setSubjects(await r.json()) } catch { } finally { setLoading(false) } }

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        if (h === 0) return `${m}m`
        if (m === 0) return `${h}h`
        return `${h}h ${m}m`
    }

    const createSubject = async (e: React.FormEvent) => { e.preventDefault(); await fetch('/api/subjects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); setShowForm(false); setFormData({ name: '', code: '', color: '#6366f1', semester: 1, targetHoursPerWeek: 5, goalGrade: 'A' }); loadSubjects() }
    const deleteSubject = async (id: string) => { if (!confirm('Are you sure you want to delete this subject? All related tasks and data will be lost.')) return; try { await fetch(`/api/subjects/${id}`, { method: 'DELETE' }); loadSubjects() } catch { } }

    const logManualTime = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSubForLog) return
        try {
            const now = new Date()
            await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectId: selectedSubForLog.id,
                    sessionType: 'manual',
                    durationMins: manualMinutes,
                    focusRating: 5,
                    sessionDate: now.toISOString().split('T')[0],
                    startTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                })
            })
            setShowManualLog(false)
            loadSubjects()
        } catch { }
    }

    const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', fontSize: '15px', fontFamily: 'inherit', background: 'var(--bg-tertiary)', border: '2px solid var(--border)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' as const }

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div style={{ width: '40px', height: '40px', border: '3px solid #a855f7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <BookOpen style={{ width: '28px', height: '28px', color: '#a855f7' }} /> Subject RPG
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>Level up your subjects with XP from study sessions</p>
                </div>
                <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', cursor: 'pointer' }}>
                    <Plus style={{ width: '18px', height: '18px' }} /> Add Subject
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
                {subjects.map(sub => {
                    const xpInLevel = sub.xp % XP_PER_LEVEL
                    const xpProgress = (xpInLevel / XP_PER_LEVEL) * 100
                    const title = LEVEL_TITLES[Math.min(sub.level, LEVEL_TITLES.length - 1)]
                    const studyProgress = Math.min((sub.totalMinutes / (sub.targetHoursPerWeek * 60)) * 100, 100)

                    return (
                        <motion.div key={sub.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card glass-card-hover"
                            style={{ padding: '28px', borderTop: `4px solid ${sub.color}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{sub.name}</h3>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub.code} • Semester {sub.semester}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <button onClick={() => deleteSubject(sub.id)} style={{ padding: '8px', borderRadius: '10px', background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete Subject">
                                        <Trash2 style={{ width: '18px', height: '18px' }} />
                                    </button>
                                    <div style={{ textAlign: 'center', padding: '10px 16px', borderRadius: '14px', background: `${sub.color}15` }}>
                                        <Trophy style={{ width: '20px', height: '20px', color: sub.color, margin: '0 auto 4px' }} />
                                        <div className="font-mono-nums" style={{ fontSize: '14px', fontWeight: 800, color: sub.color }}>Lv.{sub.level}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: sub.color }}>{title}</span>
                                    <span className="font-mono-nums" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{xpInLevel}/{XP_PER_LEVEL} XP</span>
                                </div>
                                <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 0.8 }}
                                        style={{ height: '100%', borderRadius: '4px', background: `linear-gradient(90deg, ${sub.color}, ${sub.color}cc)` }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Studied</div>
                                        <div className="font-mono-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'baseline', gap: '4px' }}>
                                            {formatTime(sub.totalMinutes)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekly Goal</div>
                                        <div className="font-mono-nums" style={{ fontSize: '15px', fontWeight: 700, color: sub.color }}>{sub.targetHoursPerWeek}h</div>
                                    </div>
                                </div>
                                <div style={{ height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'var(--bg-secondary)', position: 'relative' }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${studyProgress}%` }} transition={{ duration: 1 }}
                                        style={{ height: '100%', borderRadius: '3px', background: sub.color }} />
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                                    {studyProgress >= 100 ? '🎉 Weekly Goal Reached!' : `${Math.round(studyProgress)}% of weekly goal`}
                                </div>
                            </div>

                            <button onClick={(e) => { e.stopPropagation(); setShowManualLog(true); setSelectedSubForLog(sub) }} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: sub.color, background: `${sub.color}10`, border: `2px solid ${sub.color}30`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Clock style={{ width: '18px', height: '18px' }} /> Log Study Time
                            </button>
                        </motion.div>
                    )
                })}
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '36px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Add Subject</h2>
                                <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: '22px', height: '22px' }} /></button>
                            </div>
                            <form onSubmit={createSubject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={inputStyle} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Code</label><input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} style={inputStyle} /></div>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Color</label><input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ ...inputStyle, height: '52px', cursor: 'pointer' }} /></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Semester</label><input type="number" value={formData.semester} onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })} style={inputStyle} /></div>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Hrs/Week</label><input type="number" value={formData.targetHoursPerWeek} onChange={e => setFormData({ ...formData, targetHoursPerWeek: Number(e.target.value) })} style={inputStyle} /></div>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Goal</label><input type="text" value={formData.goalGrade} onChange={e => setFormData({ ...formData, goalGrade: e.target.value })} style={inputStyle} /></div>
                                </div>
                                <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', cursor: 'pointer' }}>Add Subject</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Log Modal */}
            <AnimatePresence>
                {showManualLog && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setShowManualLog(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Log Study Time</h2>
                                    <p style={{ fontSize: '13px', color: selectedSubForLog?.color, fontWeight: 600, marginTop: '4px' }}>{selectedSubForLog?.name}</p>
                                </div>
                                <button onClick={() => setShowManualLog(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: '22px', height: '22px' }} /></button>
                            </div>
                            <form onSubmit={logManualTime} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Duration</label>
                                        <span className="font-mono-nums" style={{ fontSize: '20px', fontWeight: 800, color: selectedSubForLog?.color }}>{manualMinutes}m</span>
                                    </div>
                                    <input type="range" min="5" max="300" step="5" value={manualMinutes} onChange={e => setManualMinutes(Number(e.target.value))} style={{ width: '100%', accentColor: selectedSubForLog?.color || '#a855f7', cursor: 'grab' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span>5m</span>
                                        <span>{formatTime(manualMinutes)}</span>
                                        <span>5h</span>
                                    </div>
                                </div>
                                <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, color: 'white', background: selectedSubForLog?.color || 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', cursor: 'pointer' }}>Save Study Session</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
