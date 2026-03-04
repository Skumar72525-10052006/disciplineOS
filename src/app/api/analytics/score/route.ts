import { NextResponse } from 'next/server'
import { calculateDisciplineScore, saveScoreSnapshot } from '@/lib/disciplineScore'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { total, breakdown } = await calculateDisciplineScore()
        await saveScoreSnapshot()
        return NextResponse.json({ score: total, breakdown })
    } catch {
        return NextResponse.json({ score: 0, breakdown: { habit: 0, task: 0, time: 0, streak: 0 } })
    }
}
