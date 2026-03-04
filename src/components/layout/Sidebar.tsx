'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Swords, CheckSquare, ListTodo, Calendar, BookOpen,
    Timer, BarChart3, Briefcase, Sparkles, Settings,
    LogOut, ChevronLeft, Menu, CalendarDays,
} from 'lucide-react'
import { useUIStore } from '@/store'
import { useEffect, useState } from 'react'

const navItems = [
    { href: '/war-room', icon: Swords, label: 'War Room', color: '#f85149' },
    { href: '/habits', icon: CheckSquare, label: 'Habits', color: '#39d353' },
    { href: '/todos', icon: ListTodo, label: 'Tasks', color: '#60a5fa' },
    { href: '/schedule', icon: Calendar, label: 'Schedule', color: '#f59e0b' },
    { href: '/subjects', icon: BookOpen, label: 'Subjects', color: '#a855f7' },
    { href: '/tracker', icon: Timer, label: 'Pomodoro', color: '#22d3ee' },
    { href: '/events', icon: CalendarDays, label: 'Events', color: '#f472b6' },
    { href: '/work', icon: Briefcase, label: 'Work Log', color: '#f97316' },
    { href: '/activities', icon: Sparkles, label: 'Activities', color: '#22d3ee' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics', color: '#818cf8' },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { sidebarOpen, toggleSidebar } = useUIStore()
    const [score, setScore] = useState(0)

    useEffect(() => {
        fetch('/api/analytics/score')
            .then((r) => r.ok ? r.json() : { score: 0 })
            .then((d) => setScore(d.score || 0))
            .catch(() => { })
    }, [pathname])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
        router.refresh()
    }

    const getScoreColor = () => {
        if (score >= 800) return '#39d353'
        if (score >= 600) return '#26a641'
        if (score >= 400) return '#f59e0b'
        if (score >= 200) return '#f97316'
        return '#f85149'
    }

    const getScoreGradient = () => {
        if (score >= 800) return 'linear-gradient(135deg, #10b981, #39d353)'
        if (score >= 600) return 'linear-gradient(135deg, #22c55e, #26a641)'
        if (score >= 400) return 'linear-gradient(135deg, #f59e0b, #fbbf24)'
        if (score >= 200) return 'linear-gradient(135deg, #f97316, #fb923c)'
        return 'linear-gradient(135deg, #ef4444, #f85149)'
    }

    return (
        <>
            <button
                onClick={toggleSidebar}
                style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 60, padding: '10px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', display: 'none' }}
                className="lg:hidden"
            >
                <Menu style={{ width: '22px', height: '22px', color: 'var(--text-primary)' }} />
            </button>

            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 50 }}
                        className="lg:hidden" onClick={toggleSidebar} />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{ x: sidebarOpen ? 0 : -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 55,
                    width: '280px',
                    background: 'linear-gradient(180deg, rgba(10, 14, 30, 0.92), rgba(6, 9, 24, 0.96))',
                    backdropFilter: 'blur(24px) saturate(1.5)',
                    WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
                    borderRight: '1px solid rgba(99, 102, 241, 0.10)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    boxShadow: '4px 0 32px rgba(0, 0, 0, 0.3), 1px 0 0 rgba(99, 102, 241, 0.05)',
                }}
            >
                {/* Header */}
                <div style={{ padding: '24px 24px', borderBottom: '1px solid rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/war-room" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            style={{
                                width: '44px', height: '44px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7, #c084fc)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35), 0 0 0 1px rgba(255,255,255,0.1) inset',
                            }}
                        >
                            <Swords style={{ width: '22px', height: '22px', color: 'white' }} />
                        </motion.div>
                        <div>
                            <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>DisciplineOS</h1>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, marginTop: '2px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Command Center</p>
                        </div>
                    </Link>
                    <button onClick={toggleSidebar} className="lg:hidden" style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <ChevronLeft style={{ width: '20px', height: '20px' }} />
                    </button>
                </div>

                {/* Discipline Score */}
                <div style={{ padding: '20px 20px', borderBottom: '1px solid rgba(99, 102, 241, 0.08)' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(15, 20, 50, 0.8), rgba(10, 14, 35, 0.6))',
                        border: '1px solid rgba(99, 102, 241, 0.12)',
                        borderRadius: '16px', padding: '20px', textAlign: 'center',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 12px rgba(0,0,0,0.2)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Shimmer effect */}
                        <div style={{
                            position: 'absolute', inset: 0, opacity: 0.5,
                            background: 'linear-gradient(90deg, transparent 30%, rgba(99,102,241,0.04) 50%, transparent 70%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 4s ease-in-out infinite',
                        }} />
                        <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '10px', position: 'relative' }}>
                            Discipline Score
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px', position: 'relative' }}>
                            <span className="font-mono-nums" style={{
                                fontSize: '36px', fontWeight: 800, color: getScoreColor(),
                                textShadow: `0 0 20px ${getScoreColor()}40`,
                            }}>{score}</span>
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/1000</span>
                        </div>
                        <div style={{ marginTop: '14px', height: '6px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                            <motion.div style={{
                                height: '100%', borderRadius: '4px',
                                background: getScoreGradient(),
                                boxShadow: `0 0 10px ${getScoreColor()}40`,
                            }}
                                initial={{ width: 0 }} animate={{ width: `${(score / 1000) * 100}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }} />
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link key={item.href} href={item.href}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '12px 16px', borderRadius: '12px', marginBottom: '2px',
                                    textDecoration: 'none', transition: 'all 0.2s ease', position: 'relative',
                                    background: isActive ? `linear-gradient(135deg, ${item.color}15, ${item.color}08)` : 'transparent',
                                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    border: isActive ? `1px solid ${item.color}20` : '1px solid transparent',
                                }}
                            >
                                {isActive && (
                                    <motion.div layoutId="activeTab" transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        style={{
                                            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                                            width: '3px', height: '22px', borderRadius: '0 4px 4px 0',
                                            background: `linear-gradient(180deg, ${item.color}, ${item.color}80)`,
                                            boxShadow: `0 0 12px ${item.color}40`,
                                        }} />
                                )}
                                <item.icon style={{
                                    width: '20px', height: '20px',
                                    color: isActive ? item.color : 'var(--text-muted)',
                                    flexShrink: 0,
                                    filter: isActive ? `drop-shadow(0 0 6px ${item.color}40)` : 'none',
                                }} />
                                <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(99, 102, 241, 0.08)' }}>
                    <Link href="/settings" style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px',
                        borderRadius: '12px', textDecoration: 'none', color: 'var(--text-secondary)',
                        transition: 'all 0.2s',
                    }}>
                        <Settings style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '14px' }}>Settings</span>
                    </Link>
                    <button onClick={handleLogout}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '12px 16px', borderRadius: '12px', background: 'transparent',
                            border: 'none', cursor: 'pointer', color: 'var(--accent-red)',
                            transition: 'all 0.2s',
                        }}>
                        <LogOut style={{ width: '20px', height: '20px' }} />
                        <span style={{ fontSize: '14px' }}>Logout</span>
                    </button>
                </div>
            </motion.aside>
        </>
    )
}
