import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        // Explicitly delete related records first (Turso may not enforce cascade)
        await prisma.timeSession.deleteMany({ where: { subjectId: id } })
        await prisma.subject.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("SUBJECT DELETE ERROR:", error)
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
