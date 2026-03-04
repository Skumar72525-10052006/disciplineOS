import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const sessions = await prisma.timeSession.findMany({
            orderBy: { createdAt: 'desc' },
            include: { subject: true },
            take: 100,
        })
        return NextResponse.json(sessions)
    } catch {
        return NextResponse.json([], { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const session = await prisma.timeSession.create({
            data: {
                title: body.title || null,
                subjectId: body.subjectId || null,
                taskId: body.taskId || null,
                sessionType: body.sessionType || 'pomodoro',
                durationMins: body.durationMins,
                focusRating: body.focusRating || null,
                sessionDate: body.sessionDate,
                startTime: body.startTime,
                notes: body.notes || null,
            },
        })

        // Award XP to subject if applicable
        if (body.subjectId) {
            const xpGain = Math.round((body.durationMins / 60) * 50)
            await prisma.subject.update({
                where: { id: body.subjectId },
                data: {
                    xp: { increment: xpGain },
                    lastActivityDate: body.sessionDate,
                },
            })
        }

        return NextResponse.json(session, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}
