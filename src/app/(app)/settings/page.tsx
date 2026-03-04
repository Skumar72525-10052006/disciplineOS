'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Shield, Timer, Download, Skull } from 'lucide-react'

export default function SettingsPage() {
    const [brutalMode, setBrutalMode] = useState(false)
    const [pomodoroWork, setPomodoroWork] = useState(25)
    const [pomodoroBreak, setPomodoroBreak] = useState(5)
    const [pomodoroLong, setPomodoroLong] = useState(15)

    const exportData = async () => {
        const [habits, todos, events, work, activities, sessions, subjects] = await Promise.all([
            fetch('/api/habits').then(r => r.json()), fetch('/api/todos').then(r => r.json()),
            fetch('/api/events').then(r => r.json()), fetch('/api/work').then(r => r.json()),
            fetch('/api/activities').then(r => r.json()), fetch('/api/sessions').then(r => r.json()),
            fetch('/api/subjects').then(r => r.json()),
        ])
        const data = { exportDate: new Date().toISOString(), habits, todos, events, work, activities, sessions, subjects }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = Object.assign(document.createElement('a'), { href: url, download: `disciplineos-export-${new Date().toISOString().split('T')[0]}.json` })
        a.click(); URL.revokeObjectURL(url)
    }

    const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', fontSize: '15px', fontFamily: 'inherit', background: 'var(--bg-tertiary)', border: '2px solid var(--border)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' as const }

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ marginBottom: '36px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <SettingsIcon style={{ width: '28px', height: '28px', color: 'var(--text-secondary)' }} /> Settings
                </h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Pomodoro */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <Timer style={{ width: '20px', height: '20px', color: '#39d0d8' }} /> Pomodoro Timer
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {[
                            { label: 'Work (min)', value: pomodoroWork, set: setPomodoroWork },
                            { label: 'Break (min)', value: pomodoroBreak, set: setPomodoroBreak },
                            { label: 'Long Break (min)', value: pomodoroLong, set: setPomodoroLong },
                        ].map(item => (
                            <div key={item.label}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>{item.label}</label>
                                <input type="number" value={item.value} onChange={e => item.set(parseInt(e.target.value))} className="font-mono-nums" style={inputStyle} />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Brutal Mode */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <Skull style={{ width: '20px', height: '20px', color: '#f85149' }} />
                            <div>
                                <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Brutal Honest Mode</h2>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Get harsh reality checks when you slack off</p>
                            </div>
                        </div>
                        <button onClick={() => setBrutalMode(!brutalMode)}
                            style={{ width: '56px', height: '30px', borderRadius: '15px', cursor: 'pointer', background: brutalMode ? '#f85149' : 'var(--bg-tertiary)', border: 'none', position: 'relative', transition: 'all 0.3s' }}>
                            <div style={{ position: 'absolute', top: '3px', width: '24px', height: '24px', borderRadius: '50%', background: 'white', transition: 'all 0.3s', left: brutalMode ? '29px' : '3px' }} />
                        </button>
                    </div>
                </motion.div>

                {/* Export */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <Download style={{ width: '20px', height: '20px', color: '#22c55e' }} /> Data Export
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>Export all your data as a JSON file for backup.</p>
                    <button onClick={exportData} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #22c55e, #39d353)', border: 'none', cursor: 'pointer' }}>
                        📦 Export All Data
                    </button>
                </motion.div>

                {/* Security */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <Shield style={{ width: '20px', height: '20px', color: '#a855f7' }} /> Security
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        Password: <code style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '13px', background: 'var(--bg-tertiary)', color: 'var(--accent-amber)' }}>admin@123</code>
                    </p>
                    <p style={{ fontSize: '12px', marginTop: '10px', color: 'var(--text-muted)' }}>
                        Change it in the <code>.env</code> file: <code style={{ color: 'var(--accent-amber)' }}>ADMIN_PASSWORD=&quot;your_password&quot;</code>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
