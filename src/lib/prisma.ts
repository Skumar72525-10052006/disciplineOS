import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'node:path'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Check if we have Turso credentials for cloud database
const tursoUrl = process.env.TURSO_DATABASE_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN

let prismaInstance: PrismaClient

if (tursoUrl && tursoToken) {
    // Cloud Mode: Use Turso (LibSQL)
    console.log('🔌 Connecting to Turso Cloud Database...')
    console.log('🔗 URL:', tursoUrl.substring(0, 15) + '...')

    // In Prisma 7, PrismaLibSql takes the Config object, NOT the client
    const adapter = new PrismaLibSql({
        url: tursoUrl,
        authToken: tursoToken,
    })
    prismaInstance = new PrismaClient({ adapter })
} else {
    // Local Mode: Use local SQLite dev.db (Native Prisma with adapter)
    console.log('💾 Connecting to Local SQLite Database (Adapter Mode)...')
    const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db')

    // Using require for better-sqlite3 to avoid top-level type/module issues in Next.js
    const Database = require('better-sqlite3')
    const db = new Database(dbPath)
    const adapter = new PrismaBetterSqlite3(db)
    prismaInstance = new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? prismaInstance

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
