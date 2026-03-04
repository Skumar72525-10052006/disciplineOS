import { prisma } from './prisma'
import { today, getDateNDaysAgo, daysBetween } from './dateHelpers'

export async function calculateDisciplineScore(): Promise<{
    total: number
    breakdown: { habit: number; task: number; time: number; streak: number }
}> {
    // 1. Habit Consistency (last 30 days) → max 400 pts
    const thirtyDaysAgo = getDateNDaysAgo(30)
    const habits = await prisma.habit.findMany({ where: { isActive: true } })
    const habitLogs = await prisma.habitLog.findMany({
        where: { logDate: { gte: thirtyDaysAgo }, status: 'completed' },
    })

    let scheduledCount = 0
    let completedCount = habitLogs.length

    for (const habit of habits) {
        const targetDays = habit.targetDays.split(',').map(Number)
        scheduledCount += targetDays.length * 4 // ~4 weeks in 30 days
    }

    const habitScore = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 400) : 0

    // 2. Task Completion (last 7 days) → max 300 pts
    const sevenDaysAgo = getDateNDaysAgo(7)
    const recentTasks = await prisma.task.findMany({
        where: { createdAt: { gte: new Date(sevenDaysAgo) } },
    })
    const completedTasks = recentTasks.filter(t => t.status === 'completed').length
    const totalTasks = recentTasks.length
    const taskScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 300) : 0

    // 3. Study Time (this week vs target) → max 200 pts
    const subjects = await prisma.subject.findMany({ where: { isActive: true } })
    const targetHours = subjects.reduce((sum, s) => sum + s.targetHoursPerWeek, 0)

    let timeScore = 0
    if (subjects.length > 0 && targetHours > 0) {
        // Only count sessions linked to a subject (not standalone pomodoro)
        const sessions = await prisma.timeSession.findMany({
            where: {
                sessionDate: { gte: sevenDaysAgo },
                subjectId: { not: null },
            },
        })
        const actualMinutes = sessions.reduce((sum, s) => sum + s.durationMins, 0)
        const actualHours = actualMinutes / 60
        timeScore = Math.round(Math.min(actualHours / targetHours, 1.0) * 200)
    }

    // 4. Streak Bonus → max 100 pts
    let longestStreak = 0
    for (const habit of habits) {
        const logs = await prisma.habitLog.findMany({
            where: { habitId: habit.id, status: 'completed' },
            orderBy: { logDate: 'desc' },
            take: 100,
        })
        let streak = 0
        const todayStr = today()
        let checkDate = todayStr
        for (const log of logs) {
            const diff = daysBetween(checkDate, log.logDate)
            if (diff <= 1) {
                streak++
                checkDate = log.logDate
            } else break
        }
        longestStreak = Math.max(longestStreak, streak)
    }
    const streakScore = Math.min(longestStreak * 5, 100)

    const total = Math.min(habitScore + taskScore + timeScore + streakScore, 1000)
    return {
        total,
        breakdown: { habit: habitScore, task: taskScore, time: timeScore, streak: streakScore },
    }
}

export async function saveScoreSnapshot(): Promise<void> {
    const { total, breakdown } = await calculateDisciplineScore()
    const todayStr = today()
    await prisma.scoreSnapshot.upsert({
        where: { snapDate: todayStr },
        create: { score: total, breakdown: JSON.stringify(breakdown), snapDate: todayStr },
        update: { score: total, breakdown: JSON.stringify(breakdown) },
    })
}
