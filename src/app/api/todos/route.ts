import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const priority = searchParams.get('priority')

        const where: Record<string, unknown> = {}
        if (status) where.status = status
        if (priority) where.priority = priority

        const tasks = await prisma.task.findMany({
            where,
            orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
            include: { subject: true },
        })
        return NextResponse.json(tasks)
    } catch {
        return NextResponse.json([], { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const task = await prisma.task.create({
            data: {
                title: body.title,
                description: body.description || null,
                priority: body.priority || 'medium',
                status: body.status || 'pending',
                dueDate: body.dueDate || null,
                dueTime: body.dueTime || null,
                estimatedMins: body.estimatedMins || null,
                tags: body.tags || null,
                subjectId: body.subjectId || null,
                parentTaskId: body.parentTaskId || null,
            },
        })
        return NextResponse.json(task, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }
}
