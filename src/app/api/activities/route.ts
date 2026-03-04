import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const activities = await prisma.activity.findMany({
            orderBy: { activityDate: 'desc' },
            take: 100,
        })
        return NextResponse.json(activities)
    } catch {
        return NextResponse.json([], { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const activity = await prisma.activity.create({
            data: {
                title: body.title,
                description: body.description || null,
                activityType: body.activityType || 'general',
                activityDate: body.activityDate,
                startTime: body.startTime || null,
                endTime: body.endTime || null,
                durationMins: body.durationMins || null,
                location: body.location || null,
                tags: body.tags || null,
                notes: body.notes || null,
            },
        })
        return NextResponse.json(activity, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}
