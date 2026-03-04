// Push scheduleDate column to Turso
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function pushSchema() {
    console.log('Connecting to Turso...');

    // Add scheduleDate column if it doesn't exist
    try {
        await client.execute("ALTER TABLE ScheduleSlot ADD COLUMN scheduleDate TEXT");
        console.log('✅ Added scheduleDate column');
    } catch (e) {
        console.log('scheduleDate column already exists or error:', e.message);
    }

    // Create index on scheduleDate
    try {
        await client.execute("CREATE INDEX IF NOT EXISTS idx_scheduledate ON ScheduleSlot(scheduleDate)");
        console.log('✅ Created index on scheduleDate');
    } catch (e) {
        console.log('Index error:', e.message);
    }

    console.log('✅ Turso schema update complete!');
}

pushSchema().catch(console.error);
