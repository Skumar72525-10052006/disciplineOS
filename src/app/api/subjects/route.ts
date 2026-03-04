import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const subjects = await prisma.subject.findMany({
            where: { isActive: true },
            include: {
                timeSessions: {
                    select: {
                        durationMins: true
                    }
                }
            },
            orderBy: { name: 'asc' },
        })

        const subjectsWithTime = subjects.map(s => {
            const totalMinutes = s.timeSessions.reduce((acc: number, sess: any) => acc + sess.durationMins, 0)
            const { timeSessions, ...rest } = s
            return {
                ...rest,
                totalMinutes
            }
        })

        return NextResponse.json(subjectsWithTime)
    } catch (err) {
        console.error("SUBJECT GET ERROR:", err)
        return NextResponse.json([], { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const subject = await prisma.subject.create({
            data: {
                name: body.name,
                code: body.code || null,
                color: body.color || '#3b82f6',
                icon: body.icon || null,
                semester: body.semester || null,
                targetHoursPerWeek: body.targetHoursPerWeek || 5,
                goalGrade: body.goalGrade || null,
            },
        })
        return NextResponse.json(subject, { status: 201 })
    } catch (err) {
        console.error("SUBJECT POST ERROR:", err);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}
