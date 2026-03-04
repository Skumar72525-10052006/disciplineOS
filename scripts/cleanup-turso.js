// Cleanup orphaned TimeSession records in Turso cloud DB
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function cleanup() {
    console.log('Connecting to Turso...');

    // 1. Delete orphaned TimeSessions (subjectId pointing to non-existent subjects)
    const orphaned = await client.execute(
        "DELETE FROM TimeSession WHERE subjectId IS NOT NULL AND subjectId NOT IN (SELECT id FROM Subject)"
    );
    console.log(`Deleted ${orphaned.rowsAffected} orphaned sessions (with invalid subjectId)`);

    // 2. Delete all TimeSessions with NULL subjectId that are manual type (these are orphaned from deleted subjects)
    const nullManual = await client.execute(
        "DELETE FROM TimeSession WHERE subjectId IS NULL AND sessionType = 'manual'"
    );
    console.log(`Deleted ${nullManual.rowsAffected} orphaned manual sessions (NULL subjectId)`);

    // 3. Show remaining sessions
    const remaining = await client.execute("SELECT COUNT(*) as count FROM TimeSession");
    console.log(`Remaining sessions: ${remaining.rows[0].count}`);

    const subjects = await client.execute("SELECT COUNT(*) as count FROM Subject");
    console.log(`Existing subjects: ${subjects.rows[0].count}`);

    console.log('✅ Cleanup complete!');
}

cleanup().catch(console.error);
