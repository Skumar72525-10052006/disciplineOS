// Push notifiedAt column to Turso
require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function pushSchema() {
    console.log('Connecting to Turso...');

    try {
        await client.execute("ALTER TABLE ScheduleSlot ADD COLUMN notifiedAt DATETIME");
        console.log('✅ Added notifiedAt column');
    } catch (e) {
        console.log('notifiedAt column already exists or error:', e.message);
    }

    console.log('✅ Turso schema update complete!');
}

pushSchema().catch(console.error);
