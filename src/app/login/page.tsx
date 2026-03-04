'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Swords, Eye, EyeOff, Lock } from 'lucide-react'

export default function LoginPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })
            if (res.ok) {
                router.push('/war-room')
                router.refresh()
            } else {
                setError('Wrong password. Access denied.')
            }
        } catch {
            setError('Connection failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-primary)', position: 'relative' }}>
            {/* Background glow */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '20%', left: '20%', width: '500px', height: '500px', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.08, background: '#a855f7' }} />
                <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '500px', height: '500px', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.08, background: '#39d0d8' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                style={{
                    width: '100%', maxWidth: '460px', position: 'relative', zIndex: 10,
                    background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
                    border: '1px solid var(--border)', borderRadius: '20px',
                    padding: '56px 44px',
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}
                        style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)', marginBottom: '28px' }}>
                        <Swords style={{ width: '40px', height: '40px', color: 'white' }} />
                    </motion.div>
                    <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>DisciplineOS</h1>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: 0, marginTop: '8px' }}>Your Personal Command Center</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            <Lock style={{ width: '16px', height: '16px' }} /> Enter Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                autoFocus
                                style={{
                                    width: '100%', padding: '16px 52px 16px 18px', borderRadius: '14px',
                                    fontSize: '16px', fontFamily: 'inherit',
                                    background: 'var(--bg-tertiary)', border: '2px solid var(--border)',
                                    color: 'var(--text-primary)', outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                                {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            style={{ padding: '16px', borderRadius: '14px', fontSize: '14px', fontWeight: 600, textAlign: 'center', marginBottom: '24px', background: 'rgba(248, 81, 73, 0.12)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.25)' }}>
                            {error}
                        </motion.div>
                    )}

                    <button type="submit" disabled={loading}
                        style={{
                            width: '100%', padding: '18px', borderRadius: '14px', fontSize: '16px',
                            fontWeight: 700, color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            opacity: loading ? 0.6 : 1, transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                        }}>
                        {loading ? (
                            <div style={{ width: '22px', height: '22px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <><Swords style={{ width: '20px', height: '20px' }} /> Enter Command Center</>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '32px' }}>
                    Every day is a battle. Show up.
                </p>
            </motion.div>
        </div>
    )
}
