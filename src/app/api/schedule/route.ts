import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date')
        const from = searchParams.get('from')
        const to = searchParams.get('to')

        let where: any = {}
        if (date) {
            where.scheduleDate = date
        } else if (from && to) {
            where.scheduleDate = { gte: from, lte: to }
        }

        const slots = await prisma.scheduleSlot.findMany({
            where,
            orderBy: [{ startTime: 'asc' }],
            include: { subject: true },
        })
        return NextResponse.json(slots)
    } catch (err) {
        console.error("SCHEDULE GET ERROR:", err)
        return NextResponse.json([], { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const slot = await prisma.scheduleSlot.create({
            data: {
                title: body.title,
                subjectId: body.subjectId || null,
                dayOfWeek: body.dayOfWeek ?? new Date(body.scheduleDate + 'T00:00:00').getDay(),
                scheduleDate: body.scheduleDate || null,
                startTime: body.startTime,
                endTime: body.endTime,
                slotType: body.slotType || 'class',
                location: body.location || null,
                color: body.color || null,
            },
        })
        return NextResponse.json(slot, { status: 201 })
    } catch (err) {
        console.error("SCHEDULE POST ERROR:", err)
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}
