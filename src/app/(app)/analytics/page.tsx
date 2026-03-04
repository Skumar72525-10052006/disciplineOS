'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Clock, Flame, Target, Zap, Activity, Calendar, BookOpen } from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
    AreaChart, Area,
    RadarChart, Radar, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
    RadialBarChart, RadialBar,
    ScatterChart, Scatter, ZAxis,
    Treemap,
    Legend,
} from 'recharts'

// ── helpers ──────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PIE_COLORS = ['#39d353', '#58a6ff', '#39d0d8', '#d29922']
const HEAT_LEVELS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
const HEAT_MISSED = '#da3633'
const RADAR_COLOR = '#6366f1'
const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = Math.round(mins % 60)
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
}

function localDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeeksOfYear() {
    const now = new Date()
    const year = now.getFullYear()
    const start = new Date(year, 0, 1)
    const startDay = start.getDay()
    const weeks: Array<{ week: number; monthLabel?: string; days: Array<{ date: string; level: number; count: number; dayOfWeek: number; isFuture: boolean; isOutOfYear: boolean }> }> = []
    const d = new Date(start)
    d.setDate(d.getDate() - startDay) // align to Sunday
    let weekNum = 0
    let lastMonth = -1
    const endOfYear = new Date(year, 11, 31)
    // Also iterate through the final partial week after Dec 31
    const lastSat = new Date(endOfYear)
    lastSat.setDate(lastSat.getDate() + (6 - lastSat.getDay()))
    while (d <= lastSat) {
        const week: Array<{ date: string; level: number; count: number; dayOfWeek: number; isFuture: boolean; isOutOfYear: boolean }> = []
        let weekMonthLabel: string | undefined
        for (let i = 0; i < 7; i++) {
            const dateStr = localDateStr(d)
            const dayOfWeek = d.getDay()
            const thisMonth = d.getMonth()
            const isFuture = d > now
            const isOutOfYear = d.getFullYear() !== year
            week.push({ date: dateStr, level: 0, count: 0, dayOfWeek, isFuture, isOutOfYear })
            if (!isOutOfYear && thisMonth !== lastMonth && d.getDate() <= 7) {
                weekMonthLabel = MONTHS[thisMonth]
                lastMonth = thisMonth
            }
            d.setDate(d.getDate() + 1)
        }
        if (week.length > 0) weeks.push({ week: weekNum++, monthLabel: weekMonthLabel, days: week })
    }
    return weeks
}

function buildHeatmapData(habitLogs: Array<{ logDate: string }>) {
    const counts: Record<string, number> = {}
    habitLogs.forEach(l => { counts[l.logDate] = (counts[l.logDate] || 0) + 1 })
    const maxCount = Math.max(1, ...Object.values(counts))
    const todayStr = localDateStr(new Date())
    const weeks = getWeeksOfYear()
    weeks.forEach(w => {
        w.days.forEach(day => {
            const c = counts[day.date] || 0
            day.count = c
            if (c > 0) {
                day.level = Math.min(4, Math.ceil((c / maxCount) * 4))
            } else if (!day.isFuture && day.date < todayStr) {
                // Any past day with no activity = missed (red)
                day.level = -1
            } else {
                day.level = 0 // today or future
            }
        })
    })
    return weeks
}

function last14Days() {
    const days = []
    for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        days.push({ date: d.toISOString().split('T')[0], mins: 0 })
    }
    return days
}

// Custom Treemap content
const TreemapContent = (props: any) => {
    const { x, y, width, height, name, totalMinutes = 0, color, fill } = props
    if (width < 30 || height < 25) return null
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} rx={6} fill={color || fill || '#6366f1'} stroke="#0d1117" strokeWidth={2} />
            {width > 60 && height > 40 && (
                <>
                    <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#e6edf3" fontSize={12} fontWeight={600}>{name}</text>
                    <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill="#8b949e" fontSize={10}>{formatTime(totalMinutes)}</text>
                </>
            )}
        </g>
    )
}

// ── card wrapper ─────────────────────────────────────────
const Card = ({ children, delay = 0, span = 1 }: { children: React.ReactNode; delay?: number; span?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="glass-card"
        style={{ padding: '28px', gridColumn: span > 1 ? `span ${span}` : undefined }}
    >
        {children}
    </motion.div>
)
const CardTitle = ({ icon: Icon, color, children }: { icon: any; color: string; children: React.ReactNode }) => (
    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Icon style={{ width: '18px', height: '18px', color }} /> {children}
    </h3>
)
const tooltipStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', fontSize: '13px', color: '#e6edf3', padding: '10px 14px' }

// ══════════════════════════════════════════════════════════
export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [breakdown, setBreakdown] = useState({ habit: 0, task: 0, time: 0, streak: 0 })
    const [score, setScore] = useState(0)
    const [habitData, setHabitData] = useState<Array<{ name: string; completed: number; total: number; streak: number }>>([])
    const [sessionData, setSessionData] = useState<Array<{ date: string; mins: number }>>([])
    const [workData, setWorkData] = useState<Array<{ month: string; hours: number; earnings: number }>>([])
    const [heatmapWeeks, setHeatmapWeeks] = useState<ReturnType<typeof getWeeksOfYear>>([])
    const [subjectData, setSubjectData] = useState<Array<{ name: string; hours: number; xp: number; color: string }>>([])
    const [scatterData, setScatterData] = useState<Array<{ mins: number; rating: number; subject: string }>>([])
    const [weekdayData, setWeekdayData] = useState<Array<{ day: string; habits: number; study: number; work: number }>>([])

    useEffect(() => {
        loadAll()
        // Auto-refresh every 30 seconds for dynamic updates
        const interval = setInterval(loadAll, 30000)
        return () => clearInterval(interval)
    }, [])

    const loadAll = async () => {
        try {
            const [scoreRes, habitsRes, workRes, sessionsRes, subjectsRes] = await Promise.all([
                fetch('/api/analytics/score').then(r => r.ok ? r.json() : { score: 0, breakdown: { habit: 0, task: 0, time: 0, streak: 0 } }),
                fetch('/api/habits').then(r => r.ok ? r.json() : []),
                fetch('/api/work').then(r => r.ok ? r.json() : []),
                fetch('/api/sessions').then(r => r.ok ? r.json() : []),
                fetch('/api/subjects').then(r => r.ok ? r.json() : []),
            ])

            setScore(scoreRes.score || 0)
            setBreakdown(scoreRes.breakdown || { habit: 0, task: 0, time: 0, streak: 0 })

            // habit data + heatmap
            const allLogs: Array<{ logDate: string }> = []
            const hData = habitsRes.length > 0
                ? habitsRes.map((h: any) => {
                    (h.logs || []).forEach((l: any) => allLogs.push(l))
                    const streak = computeStreak(h.logs || [])
                    return { name: h.name.length > 14 ? h.name.substring(0, 14) + '…' : h.name, completed: h.logs?.length || 0, total: 30, streak }
                })
                : [{ name: 'Morning Walk', completed: 0, total: 30, streak: 0 }, { name: 'Meditation', completed: 0, total: 30, streak: 0 }, { name: 'Study', completed: 0, total: 30, streak: 0 }, { name: 'Exercise', completed: 0, total: 30, streak: 0 }]
            setHabitData(hData)
            setHeatmapWeeks(buildHeatmapData(allLogs))

            // session data (line/area) — only count subject-linked study sessions
            const studySessions = sessionsRes.filter((s: any) => s.subjectId)
            const sessionsByDate: Record<string, number> = {}
            const scatterPts: Array<{ mins: number; rating: number; subject: string }> = []
            studySessions.forEach((s: any) => {
                sessionsByDate[s.sessionDate] = (sessionsByDate[s.sessionDate] || 0) + s.durationMins
                if (s.focusRating) scatterPts.push({ mins: s.durationMins, rating: s.focusRating, subject: s.subject?.name || 'General' })
            })
            const sData = Object.keys(sessionsByDate).length > 0
                ? Object.entries(sessionsByDate).map(([date, mins]) => ({ date, mins })).slice(-14)
                : last14Days()
            setSessionData(sData)
            setScatterData(scatterPts.length > 0 ? scatterPts : [{ mins: 0, rating: 0, subject: 'No data' }])

            // work data
            const workByMonth: Record<string, { hours: number; earnings: number }> = {}
            workRes.forEach((w: any) => {
                const m = w.workDate.substring(0, 7)
                if (!workByMonth[m]) workByMonth[m] = { hours: 0, earnings: 0 }
                workByMonth[m].hours += w.hoursWorked
                workByMonth[m].earnings += w.earnings || 0
            })
            setWorkData(Object.keys(workByMonth).length > 0
                ? Object.entries(workByMonth).map(([month, d]) => ({ month, ...d }))
                : [{ month: '2026-01', hours: 0, earnings: 0 }, { month: '2026-02', hours: 0, earnings: 0 }, { month: '2026-03', hours: 0, earnings: 0 }])

            // subjects treemap — only show real subjects, no placeholders
            const subs = subjectsRes.length > 0
                ? subjectsRes.map((s: any) => ({ name: s.name, hours: (s.totalMinutes || 0) / 60, totalMinutes: s.totalMinutes || 0, xp: s.xp || 0, color: s.color || '#6366f1' }))
                : []
            setSubjectData(subs)

            // weekday breakdown — only count subject-linked study sessions
            const wdMap: Record<number, { habits: number; study: number; work: number }> = {}
            for (let i = 0; i < 7; i++) wdMap[i] = { habits: 0, study: 0, work: 0 }
            allLogs.forEach(l => { const d = new Date(l.logDate).getDay(); wdMap[d].habits++ })
            studySessions.forEach((s: any) => { const d = new Date(s.sessionDate).getDay(); wdMap[d].study += s.durationMins })
            workRes.forEach((w: any) => { const d = new Date(w.workDate).getDay(); wdMap[d].work += Math.round(w.hoursWorked * 60) })
            setWeekdayData(DAYS.map((day, i) => ({ day, habits: wdMap[i].habits, study: wdMap[i].study, work: wdMap[i].work })))

        } catch (err) { console.error('Analytics error:', err) }
        finally { setLoading(false) }
    }

    // ── derived ──
    const radarData = useMemo(() => [
        { stat: 'Habits', value: breakdown.habit, max: 300 },
        { stat: 'Tasks', value: breakdown.task, max: 250 },
        { stat: 'Study', value: breakdown.time, max: 300 },
        { stat: 'Streaks', value: breakdown.streak, max: 150 },
        { stat: 'Consistency', value: Math.min(100, Math.round((breakdown.habit + breakdown.streak) / 4.5)), max: 100 },
        { stat: 'Focus', value: Math.min(100, Math.round(breakdown.time / 3)), max: 100 },
    ], [breakdown])

    const cumulativeStudy = useMemo(() => {
        let cum = 0
        return sessionData.map(s => { cum += s.mins; return { date: s.date, mins: s.mins, cumulative: cum } })
    }, [sessionData])

    const gaugeData = useMemo(() => [
        { name: 'Score', value: score, fill: score >= 700 ? '#39d353' : score >= 400 ? '#d29922' : '#f85149' }
    ], [score])

    const pieData = useMemo(() => {
        const p = [
            { name: 'Habits', value: breakdown.habit || 0 },
            { name: 'Tasks', value: breakdown.task || 0 },
            { name: 'Study', value: breakdown.time || 0 },
            { name: 'Streak', value: breakdown.streak || 0 },
        ]
        return p.every(x => x.value === 0) ? p.map(x => ({ ...x, value: 25 })) : p
    }, [breakdown])
    const pieAllZero = pieData.every(p => p.value === 25)

    const totalHabitsCompleted = habitData.reduce((a, h) => a + h.completed, 0)
    const totalStudyMins = sessionData.reduce((a, s) => a + s.mins, 0)
    const bestStreak = Math.max(0, ...habitData.map(h => h.streak))

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    )

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <BarChart3 style={{ width: '28px', height: '28px', color: '#6366f1' }} /> Analytics Dashboard
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>Deep insights into your discipline journey</p>
            </div>

            {/* ── Row 1: Quick Stats ─────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                {[
                    { label: 'Discipline Score', value: `${score}/1000`, icon: Zap, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
                    { label: 'Habits Completed', value: totalHabitsCompleted, icon: Target, color: '#39d353', bg: 'rgba(57,211,83,0.12)' },
                    { label: 'Study Minutes', value: totalStudyMins, icon: Clock, color: '#39d0d8', bg: 'rgba(57,208,216,0.12)' },
                    { label: 'Best Streak', value: `${bestStreak} days`, icon: Flame, color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon style={{ width: '22px', height: '22px', color: stat.color }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Row 2: GitHub Contribution Heatmap (full width) ── */}
            <Card delay={0.1} span={1}>
                <CardTitle icon={Calendar} color="#39d353">Habit Contribution Graph</CardTitle>
                <div style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: '700px' }}>
                        {/* Month labels row */}
                        <div style={{ display: 'flex', paddingLeft: '36px', marginBottom: '4px', gap: '2px' }}>
                            {heatmapWeeks.map((week) => (
                                <div key={week.week} style={{ flex: 1, minWidth: '16px', fontSize: '11px', color: '#8b949e', textAlign: 'left', overflow: 'visible', whiteSpace: 'nowrap' }}>
                                    {week.monthLabel || ''}
                                </div>
                            ))}
                        </div>
                        {/* Grid: day labels + cells */}
                        <div style={{ display: 'flex' }}>
                            {/* Day of week labels */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '6px', width: '30px', flexShrink: 0 }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, i) => (
                                    <div key={i} style={{ height: '15px', fontSize: '10px', lineHeight: '15px', color: '#8b949e', textAlign: 'right' }}>{label}</div>
                                ))}
                            </div>
                            {/* Week columns */}
                            <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
                                {heatmapWeeks.map((week) => (
                                    <div key={week.week} style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                        {Array.from({ length: 7 }, (_, dayIdx) => {
                                            const dayCell = week.days.find(d => d.dayOfWeek === dayIdx)
                                            if (!dayCell || dayCell.isOutOfYear) return <div key={dayIdx} style={{ width: '100%', height: '15px', maxHeight: '15px' }} />
                                            return (
                                                <div
                                                    key={dayCell.date}
                                                    title={dayCell.isFuture ? dayCell.date : dayCell.level === -1 ? `Missed on ${dayCell.date}` : `${dayCell.count} contributions on ${dayCell.date}`}
                                                    style={{
                                                        width: '100%', height: '15px', maxHeight: '15px',
                                                        borderRadius: '2px',
                                                        background: dayCell.isFuture ? '#0d1117' : dayCell.level === -1 ? HEAT_MISSED : HEAT_LEVELS[dayCell.level],
                                                        cursor: dayCell.isFuture ? 'default' : 'pointer',
                                                        outline: dayCell.isFuture ? '1px solid #21262d' : dayCell.level === -1 ? '1px solid rgba(218,54,51,0.3)' : '1px solid rgba(27,31,35,0.06)',
                                                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                                    }}
                                                    onMouseEnter={e => { if (!dayCell.isFuture) { e.currentTarget.style.transform = 'scale(1.3)'; e.currentTarget.style.zIndex = '1'; e.currentTarget.style.boxShadow = dayCell.level === -1 ? '0 0 6px rgba(248,81,73,0.5)' : '0 0 6px rgba(57,211,83,0.4)' } }}
                                                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '0'; e.currentTarget.style.boxShadow = 'none' }}
                                                />
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Legend */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', marginTop: '10px', fontSize: '11px', color: '#8b949e' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: HEAT_MISSED }} />
                            Missed
                            <span style={{ margin: '0 6px', color: '#30363d' }}>|</span>
                            Less
                            {HEAT_LEVELS.map((c, i) => (
                                <div key={i} style={{ width: '12px', height: '12px', borderRadius: '2px', background: c, outline: '1px solid rgba(27,31,35,0.06)' }} />
                            ))}
                            More
                        </div>
                    </div>
                </div>
            </Card>

            {/* ── Row 3: Radar + Gauge + Pie ──────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
                {/* Radar Chart */}
                <Card delay={0.15}>
                    <CardTitle icon={Activity} color="#6366f1">Discipline Radar</CardTitle>
                    <ResponsiveContainer width="100%" height={260}>
                        <RadarChart data={radarData} outerRadius={90}>
                            <PolarGrid stroke="#30363d" />
                            <PolarAngleAxis dataKey="stat" tick={{ fontSize: 11, fill: '#8b949e' }} />
                            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 'dataMax']} />
                            <Radar dataKey="value" stroke={RADAR_COLOR} fill={RADAR_COLOR} fillOpacity={0.25} strokeWidth={2} />
                            <Tooltip contentStyle={tooltipStyle} />
                        </RadarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Radial Gauge */}
                <Card delay={0.2}>
                    <CardTitle icon={Zap} color="#d29922">Score Gauge</CardTitle>
                    <ResponsiveContainer width="100%" height={260}>
                        <RadialBarChart
                            innerRadius="60%" outerRadius="90%"
                            data={gaugeData} startAngle={210} endAngle={-30}
                            barSize={18}
                        >
                            <RadialBar background={{ fill: '#21262d' }} dataKey="value" cornerRadius={10} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', marginTop: '-90px', position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>{score}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 1000</div>
                    </div>
                </Card>

                {/* Pie Chart */}
                <Card delay={0.25}>
                    <CardTitle icon={Target} color="#39d353">Score Breakdown</CardTitle>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" stroke="none">
                                {pieData.map((_, i) => <Cell key={i} fill={pieAllZero ? `${PIE_COLORS[i]}40` : PIE_COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '4px' }}>
                        {[{ n: 'Habits', v: breakdown.habit }, { n: 'Tasks', v: breakdown.task }, { n: 'Study', v: breakdown.time }, { n: 'Streak', v: breakdown.streak }].map((item, i) => (
                            <div key={item.n} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: PIE_COLORS[i] }} />
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.n}: {item.v}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* ── Row 4: Stacked Activity + Cumulative Area ──── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                {/* Stacked Bar — Weekly Activity */}
                <Card delay={0.3}>
                    <CardTitle icon={BarChart3} color="#58a6ff">Weekly Activity Breakdown</CardTitle>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={weekdayData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#8b949e' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#8b949e' }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Bar dataKey="habits" stackId="a" fill="#39d353" radius={[0, 0, 0, 0]} name="Habits" />
                            <Bar dataKey="study" stackId="a" fill="#58a6ff" name="Study (min)" />
                            <Bar dataKey="work" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} name="Work (min)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Gradient Area — Cumulative Study */}
                <Card delay={0.35}>
                    <CardTitle icon={TrendingUp} color="#39d0d8">Cumulative Study Time</CardTitle>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={cumulativeStudy}>
                            <defs>
                                <linearGradient id="gradStudy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#39d0d8" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#39d0d8" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8b949e' }} tickFormatter={v => v.substring(5)} />
                            <YAxis tick={{ fontSize: 11, fill: '#8b949e' }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area type="monotone" dataKey="cumulative" stroke="#39d0d8" strokeWidth={2} fill="url(#gradStudy)" name="Total (min)" />
                            <Line type="monotone" dataKey="mins" stroke="#6366f1" strokeWidth={1.5} dot={false} name="Daily (min)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* ── Row 5: Treemap + Scatter ────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                {/* Treemap — Subject Distribution */}
                <Card delay={0.4}>
                    <CardTitle icon={BarChart3} color="#a855f7">Subject Time Distribution</CardTitle>
                    {subjectData.length === 0 ? (
                        <div style={{ height: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <BookOpen style={{ width: '40px', height: '40px', color: 'var(--text-muted)', opacity: 0.3, marginBottom: '12px' }} />
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No subjects added yet</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', opacity: 0.6 }}>Add subjects and log study time to see the distribution</p>
                        </div>
                    ) : subjectData.some(s => s.hours > 0) ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <Treemap
                                data={subjectData}
                                dataKey="hours"
                                nameKey="name"
                                content={<TreemapContent />}
                            />
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '260px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {subjectData.map(s => (
                                    <div key={s.name} style={{ padding: '20px 28px', borderRadius: '10px', background: `${s.color}18`, border: `1px solid ${s.color}30`, textAlign: 'center' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: s.color }}>{s.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>0 hours</div>
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Log study sessions to fill the treemap</p>
                        </div>
                    )}
                </Card>

                {/* Scatter — Focus vs Duration */}
                <Card delay={0.45}>
                    <CardTitle icon={Zap} color="#ec4899">Focus Rating vs Study Duration</CardTitle>
                    <ResponsiveContainer width="100%" height={260}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                            <XAxis dataKey="mins" name="Duration" unit="min" tick={{ fontSize: 11, fill: '#8b949e' }} />
                            <YAxis dataKey="rating" name="Focus" domain={[0, 5]} tick={{ fontSize: 11, fill: '#8b949e' }} />
                            <ZAxis range={[60, 200]} />
                            <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3', stroke: '#58a6ff' }}
                                formatter={(val: any, name: any) => [val, name === 'mins' ? 'Duration (min)' : 'Focus Rating']} />
                            <Scatter data={scatterData} fill="#ec4899" fillOpacity={0.7} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* ── Row 6: Habit Bar + Work Earnings ────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', marginBottom: '40px' }}>
                {/* Habit Completion */}
                <Card delay={0.5}>
                    <CardTitle icon={Target} color="#39d353">Habit Completion (30 Days)</CardTitle>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={habitData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#8b949e' }} domain={[0, 30]} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#8b949e' }} width={100} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="completed" fill="#39d353" radius={[0, 6, 6, 0]} barSize={18} background={{ fill: '#21262d', radius: [0, 6, 6, 0] as any }} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Work Earnings dual-axis */}
                <Card delay={0.55}>
                    <CardTitle icon={TrendingUp} color="#f97316">Work Hours &amp; Earnings</CardTitle>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={workData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8b949e' }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#8b949e' }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#8b949e' }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Bar yAxisId="left" dataKey="hours" fill="#f97316" radius={[6, 6, 0, 0]} name="Hours" barSize={24} />
                            <Bar yAxisId="right" dataKey="earnings" fill="#22c55e" radius={[6, 6, 0, 0]} name="Earnings (₹)" barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    )
}

// ── streak calculator ──
function computeStreak(logs: Array<{ logDate: string }>): number {
    if (!logs || logs.length === 0) return 0
    const dates = [...new Set(logs.map(l => l.logDate))].sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    let expected = today
    for (const d of dates) {
        if (d === expected) {
            streak++
            const prev = new Date(expected)
            prev.setDate(prev.getDate() - 1)
            expected = prev.toISOString().split('T')[0]
        } else if (d < expected) break
    }
    return streak
}
