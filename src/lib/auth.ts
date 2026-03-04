import { cookies } from 'next/headers'
import crypto from 'crypto'

const SESSION_NAME = 'discipline_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex')
}

export async function verifyPassword(password: string): Promise<boolean> {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123'
    return password === adminPassword
}

export async function createSession(): Promise<void> {
    const cookieStore = await cookies()
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = hashPassword(sessionToken)

    cookieStore.set(SESSION_NAME, hashedToken, {
        httpOnly: true,
        secure: false, // localhost
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
    })
}

export async function destroySession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies()
    const session = cookieStore.get(SESSION_NAME)
    return !!session?.value
}
