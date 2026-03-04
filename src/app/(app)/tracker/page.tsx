'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Timer, Play, Pause, RotateCcw, Star, Coffee, BookOpen, Trash2, History } from 'lucide-react'
import { format } from 'date-fns'

interface FocusSession { id: string; sessionDate: string; startTime: string | null; durationMins: number; focusRating: number | null; sessionType: string }

export default function TrackerPage() {
    const [mode, setMode] = useState<'work' | 'break' | 'longBreak'>('work')
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isRunning, setIsRunning] = useState(false)
    const [sessions, setSessions] = useState(0)
    const [sessionHistory, setSessionHistory] = useState<FocusSession[]>([])
    const [showRating, setShowRating] = useState(false)
    const [focusRating, setFocusRating] = useState(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const DURATIONS = { work: 25 * 60, break: 5 * 60, longBreak: 15 * 60 }
    const totalTime = DURATIONS[mode]
    const progress = ((totalTime - timeLeft) / totalTime) * 100
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    const loadSessionHistory = useCallback(async () => {
        try {
            const r = await fetch('/api/sessions?type=pomodoro')
            const data = await r.json()
            // Only show pomodoro sessions (no subject-linked manual logs)
            const pomodoroSessions = Array.isArray(data) ? data.filter((s: any) => s.sessionType === 'pomodoro') : []
            setSessionHistory(pomodoroSessions)
        } catch { }
    }, [])

    useEffect(() => { loadSessionHistory() }, [loadSessionHistory])

    const deleteSession = async (id: string) => {
        if (!confirm('Are you sure you want to delete this session?')) return
        try {
            await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
            loadSessionHistory()
        } catch { }
    }

    const saveSession = useCallback(async (rating: number) => {
        const now = new Date()
        await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subjectId: null,
                sessionType: 'pomodoro',
                durationMins: DURATIONS.work / 60,
                focusRating: rating,
                sessionDate: format(now, 'yyyy-MM-dd'),
                startTime: format(new Date(now.getTime() - DURATIONS.work * 1000), 'HH:mm')
            })
        })
        setShowRating(false); setFocusRating(0); loadSessionHistory()
    }, [DURATIONS.work, loadSessionHistory])

    useEffect(() => {
        if (isRunning && timeLeft > 0) { intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000) }
        else if (timeLeft === 0) { setIsRunning(false); if (mode === 'work') { setSessions(s => s + 1); setShowRating(true) } else { switchMode('work') } }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [isRunning, timeLeft, mode])

    const switchMode = (m: 'work' | 'break' | 'longBreak') => { setMode(m); setTimeLeft(DURATIONS[m]); setIsRunning(false) }
    const reset = () => { setTimeLeft(DURATIONS[mode]); setIsRunning(false) }

    const circumference = 2 * Math.PI * 130
    const offset = circumference - (progress / 100) * circumference
    const modeColors = { work: '#f85149', break: '#39d353', longBreak: '#58a6ff' }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ marginBottom: '36px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <Timer style={{ width: '28px', height: '28px', color: '#f85149' }} /> Pomodoro Timer
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>Stay focused. No distractions. Just deep work.</p>
            </div>

            <div className="glass-card" style={{ padding: '48px', textAlign: 'center', marginBottom: '32px' }}>
                {/* Mode Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
                    {[
                        { key: 'work' as const, label: 'Focus', icon: BookOpen },
                        { key: 'break' as const, label: 'Break', icon: Coffee },
                        { key: 'longBreak' as const, label: 'Long Break', icon: Coffee },
                    ].map(m => (
                        <button key={m.key} onClick={() => switchMode(m.key)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', background: mode === m.key ? `${modeColors[m.key]}20` : 'var(--bg-tertiary)', color: mode === m.key ? modeColors[m.key] : 'var(--text-muted)', border: mode === m.key ? `2px solid ${modeColors[m.key]}` : '2px solid var(--border)' }}>
                            <m.icon style={{ width: '18px', height: '18px' }} /> {m.label}
                        </button>
                    ))}
                </div>

                {/* Timer Ring */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '40px' }}>
                    <svg width="300" height="300" viewBox="0 0 300 300">
                        <circle cx="150" cy="150" r="130" fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
                        <circle cx="150" cy="150" r="130" fill="none" stroke={modeColors[mode]} strokeWidth="6"
                            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 150 150)" className="timer-ring" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="font-mono-nums" style={{ fontSize: '56px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                        <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px', color: modeColors[mode], fontWeight: 600 }}>
                            {mode === 'work' ? 'Focus Time' : mode === 'break' ? 'Short Break' : 'Long Break'}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '32px' }}>
                    <button onClick={() => setIsRunning(!isRunning)} style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: modeColors[mode], border: 'none', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: `0 4px 16px ${modeColors[mode]}40` }}>
                        {isRunning ? <Pause style={{ width: '28px', height: '28px' }} /> : <Play style={{ width: '28px', height: '28px', marginLeft: '3px' }} />}
                    </button>
                    <button onClick={reset} style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
                        <RotateCcw style={{ width: '24px', height: '24px' }} />
                    </button>
                </div>

                {/* Session dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    {Array.from({ length: Math.max(4, sessions) }).map((_, i) => (
                        <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: i < sessions ? modeColors[mode] : 'var(--bg-tertiary)', transition: 'all 0.3s' }} />
                    ))}
                </div>
                <p style={{ fontSize: '13px', marginTop: '10px', color: 'var(--text-muted)' }}>{sessions} focus sessions completed today</p>
            </div>

            {/* Pomodoro History */}
            {sessionHistory.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <History style={{ width: '20px', height: '20px', color: '#f85149' }} /> Focus History
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {sessionHistory.slice(0, 5).map((session) => (
                            <div key={session.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #f85149' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Pomodoro Focus</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {format(new Date(session.sessionDate), 'MMM dd')} • {session.startTime} • {session.durationMins}m • Rating: {session.focusRating || 0}/5
                                    </div>
                                </div>
                                <button onClick={() => deleteSession(session.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '8px' }}>
                                    <Trash2 style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Focus Rating Modal */}
            {showRating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>🎯 Session Complete!</h2>
                        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '24px' }}>How focused were you?</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
                            {[1, 2, 3, 4, 5].map(r => (
                                <button key={r} onClick={() => setFocusRating(r)} style={{ width: '48px', height: '48px', borderRadius: '12px', cursor: 'pointer', background: focusRating >= r ? '#d29922' : 'var(--bg-tertiary)', color: focusRating >= r ? '#fff' : 'var(--text-muted)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                    <Star style={{ width: '24px', height: '24px' }} fill={focusRating >= r ? '#fff' : 'none'} />
                                </button>
                            ))}
                        </div>
                        <button onClick={() => saveSession(focusRating || 3)} style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #f85149, #da3633)', border: 'none', cursor: 'pointer' }}>Save & Continue</button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}
