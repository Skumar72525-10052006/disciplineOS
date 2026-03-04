import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const logs = await prisma.workLog.findMany({
            orderBy: { workDate: 'desc' },
            take: 100,
        })
        return NextResponse.json(logs)
    } catch {
        return NextResponse.json([], { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const log = await prisma.workLog.create({
            data: {
                workDate: body.workDate,
                startTime: body.startTime || null,
                endTime: body.endTime || null,
                hoursWorked: body.hoursWorked,
                workplace: body.workplace || null,
                workType: body.workType || 'part_time',
                earnings: body.earnings || null,
                notes: body.notes || null,
            },
        })
        return NextResponse.json(log, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}
