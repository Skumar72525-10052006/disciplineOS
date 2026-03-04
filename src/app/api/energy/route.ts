import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { today } from '@/lib/dateHelpers'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const logDate = body.logDate || today()

        const log = await prisma.energyLog.upsert({
            where: { logDate },
            create: { logDate, level: body.level },
            update: { level: body.level },
        })
        return NextResponse.json(log)
    } catch {
        return NextResponse.json({ error: 'Failed to log energy' }, { status: 500 })
    }
}
