import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            orderBy: { startDate: 'asc' },
            include: { subject: true },
        })
        return NextResponse.json(events)
    } catch {
        return NextResponse.json([], { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const event = await prisma.event.create({
            data: {
                title: body.title,
                description: body.description || null,
                eventType: body.eventType || 'general',
                startDate: body.startDate,
                startTime: body.startTime || null,
                endDate: body.endDate || null,
                endTime: body.endTime || null,
                allDay: body.allDay || false,
                subjectId: body.subjectId || null,
                location: body.location || null,
                color: body.color || null,
                tags: body.tags || null,
                notes: body.notes || null,
            },
        })
        return NextResponse.json(event, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}
