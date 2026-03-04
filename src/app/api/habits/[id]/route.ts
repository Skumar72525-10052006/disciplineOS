import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single habit
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const habit = await prisma.habit.findUnique({
            where: { id },
            include: { logs: { orderBy: { logDate: 'desc' } } },
        })
        if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(habit)
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// PUT update habit
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const body = await request.json()
        const habit = await prisma.habit.update({
            where: { id },
            data: body,
        })
        return NextResponse.json(habit)
    } catch {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}

// DELETE habit (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        await prisma.habit.update({
            where: { id },
            data: { isActive: false },
        })
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
