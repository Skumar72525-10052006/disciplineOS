import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all habits
export async function GET() {
    try {
        const habits = await prisma.habit.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                logs: {
                    orderBy: { logDate: 'desc' },
                    take: 60, // last ~2 months
                },
            },
        })
        return NextResponse.json(habits)
    } catch (error) {
        console.error("GET HABITS ERROR:", error);
        return NextResponse.json([], { status: 500 })
    }
}

// POST create habit
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const habit = await prisma.habit.create({
            data: {
                name: body.name,
                description: body.description || null,
                icon: body.icon || '⭐',
                color: body.color || '#6366f1',
                category: body.category || 'general',
                targetDays: body.targetDays || '1,2,3,4,5,6,7',
                isChain: body.isChain || false,
            },
        })
        return NextResponse.json(habit, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
    }
}
