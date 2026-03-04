import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        await prisma.timeSession.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("SESSION DELETE ERROR:", error)
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
