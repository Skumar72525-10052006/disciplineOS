// Script to push Prisma schema tables to Turso cloud database
// Run: node scripts/push-turso.mjs

import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'libsql://disciplineos-skumar72525-10052006.aws-ap-south-1.turso.io',
    authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI1MzUxMDQsImlkIjoiMDE5Y2IzNTEtZmUwMS03NzJkLWIzNDQtYTZkMDJmOTAzNDgyIiwicmlkIjoiNTY5NzYxMjEtNWZkMC00N2JmLWIxOGUtYzczYzA4NGYzODI2In0.uLZf84z40SvQO0YSjuAAEcjrU2e6o0l051mEFoiW5MPXOhsE7Q1B9X5dKJpFw2YEwzolQduu_NgXyDIt_xlxBA',
});

const tables = [
    `CREATE TABLE IF NOT EXISTS "Habit" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "icon" TEXT NOT NULL DEFAULT '⭐',
        "color" TEXT NOT NULL DEFAULT '#6366f1',
        "category" TEXT NOT NULL DEFAULT 'general',
        "targetDays" TEXT NOT NULL DEFAULT '1,2,3,4,5,6,7',
        "isActive" INTEGER NOT NULL DEFAULT 1,
        "isChain" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "HabitLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "habitId" TEXT NOT NULL,
        "logDate" TEXT NOT NULL,
        "completed" INTEGER NOT NULL DEFAULT 1,
        "note" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "HabitLog_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "HabitLog_habitId_logDate_key" ON "HabitLog" ("habitId", "logDate")`,
    `CREATE INDEX IF NOT EXISTS "HabitLog_logDate_idx" ON "HabitLog" ("logDate")`,
    `CREATE TABLE IF NOT EXISTS "Task" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "priority" TEXT NOT NULL DEFAULT 'medium',
        "status" TEXT NOT NULL DEFAULT 'pending',
        "dueDate" TEXT,
        "category" TEXT NOT NULL DEFAULT 'general',
        "parentId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedAt" DATETIME,
        CONSTRAINT "Task_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "ScheduleSlot" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "dayOfWeek" INTEGER NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "room" TEXT,
        "type" TEXT NOT NULL DEFAULT 'lecture',
        "color" TEXT NOT NULL DEFAULT '#6366f1'
    )`,
    `CREATE TABLE IF NOT EXISTS "Subject" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT,
        "color" TEXT NOT NULL DEFAULT '#6366f1',
        "icon" TEXT NOT NULL DEFAULT '📚',
        "xp" INTEGER NOT NULL DEFAULT 0,
        "level" INTEGER NOT NULL DEFAULT 1,
        "lastStudied" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "TimeSession" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "subjectId" TEXT,
        "sessionDate" TEXT NOT NULL,
        "durationMins" INTEGER NOT NULL,
        "focusRating" INTEGER,
        "sessionType" TEXT NOT NULL DEFAULT 'study',
        "note" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TimeSession_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS "TimeSession_sessionDate_idx" ON "TimeSession" ("sessionDate")`,
    `CREATE TABLE IF NOT EXISTS "EnergyLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "logDate" TEXT NOT NULL,
        "level" INTEGER NOT NULL,
        "note" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "EnergyLog_logDate_key" ON "EnergyLog" ("logDate")`,
    `CREATE TABLE IF NOT EXISTS "WorkLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "workDate" TEXT NOT NULL,
        "hoursWorked" REAL NOT NULL,
        "hourlyRate" REAL NOT NULL DEFAULT 0,
        "earnings" REAL NOT NULL DEFAULT 0,
        "note" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS "WorkLog_workDate_idx" ON "WorkLog" ("workDate")`,
    `CREATE TABLE IF NOT EXISTS "Event" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "eventDate" TEXT NOT NULL,
        "endDate" TEXT,
        "category" TEXT NOT NULL DEFAULT 'general',
        "color" TEXT NOT NULL DEFAULT '#6366f1',
        "isAllDay" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Activity" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "activityDate" TEXT NOT NULL,
        "durationMins" INTEGER,
        "category" TEXT NOT NULL DEFAULT 'general',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS "Activity_activityDate_idx" ON "Activity" ("activityDate")`,
    `CREATE TABLE IF NOT EXISTS "ScoreSnapshot" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "snapDate" TEXT NOT NULL,
        "score" INTEGER NOT NULL,
        "breakdown" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "ScoreSnapshot_snapDate_key" ON "ScoreSnapshot" ("snapDate")`,
    `CREATE TABLE IF NOT EXISTS "WeeklyReport" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "weekStart" TEXT NOT NULL,
        "reportData" TEXT NOT NULL,
        "highlights" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "WeeklyReport_weekStart_key" ON "WeeklyReport" ("weekStart")`,
    `CREATE TABLE IF NOT EXISTS "Settings" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
        "brutalMode" INTEGER NOT NULL DEFAULT 0,
        "pomodoroWork" INTEGER NOT NULL DEFAULT 25,
        "pomodoroBreak" INTEGER NOT NULL DEFAULT 5,
        "pomodoroLong" INTEGER NOT NULL DEFAULT 15,
        "dailyStudyGoal" INTEGER NOT NULL DEFAULT 120,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "PushSubscription" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "endpoint" TEXT NOT NULL,
        "p256dh" TEXT NOT NULL,
        "auth" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription" ("endpoint")`,
];

async function main() {
    console.log('🔌 Connecting to Turso Cloud Database...');
    console.log(`   URL: ${client.url || 'from env'}\n`);

    for (const sql of tables) {
        try {
            await client.execute(sql);
            const match = sql.match(/(?:CREATE TABLE|CREATE (?:UNIQUE )?INDEX).*?"(\w+)"/i);
            console.log(`  ✅ ${match ? match[1] : 'query'}`);
        } catch (err) {
            console.error(`  ❌ Failed: ${err.message}`);
        }
    }

    // Verify tables
    console.log('\n📋 Verifying tables in Turso...\n');
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    for (const row of result.rows) {
        console.log(`  📦 ${row.name}`);
    }
    console.log(`\n✅ Total tables: ${result.rows.length}`);

    client.close();
}

main().catch(console.error);
