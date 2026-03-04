import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { today } from '@/lib/dateHelpers'

// POST toggle habit completion for today
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const todayStr = today()
        const existing = await prisma.habitLog.findUnique({
            where: { habitId_logDate: { habitId: id, logDate: todayStr } },
        })

        if (existing) {
            // Toggle off - remove log
            await prisma.habitLog.delete({ where: { id: existing.id } })
            return NextResponse.json({ completed: false, date: todayStr })
        } else {
            // Toggle on - create log
            await prisma.habitLog.create({
                data: { habitId: id, logDate: todayStr, status: 'completed' },
            })

            // Update subject XP if applicable (find related tasks/subjects)
            return NextResponse.json({ completed: true, date: todayStr })
        }
    } catch (error) {
        console.error('Failed to toggle habit:', error)
        return NextResponse.json({ error: 'Failed to toggle habit' }, { status: 500 })
    }
}
