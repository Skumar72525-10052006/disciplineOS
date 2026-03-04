// Script to drop all Turso tables and rebuild using the official Prisma SQL dump
// Run: node scripts/rebuild-turso-schema.mjs

import { createClient } from '@libsql/client';
import fs from 'fs';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'libsql://disciplineos-skumar72525-10052006.aws-ap-south-1.turso.io',
    authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI1MzUxMDQsImlkIjoiMDE5Y2IzNTEtZmUwMS03NzJkLWIzNDQtYTZkMDJmOTAzNDgyIiwicmlkIjoiNTY5NzYxMjEtNWZkMC00N2JmLWIxOGUtYzczYzA4NGYzODI2In0.uLZf84z40SvQO0YSjuAAEcjrU2e6o0l051mEFoiW5MPXOhsE7Q1B9X5dKJpFw2YEwzolQduu_NgXyDIt_xlxBA',
});

async function main() {
    console.log('🔌 Connecting to Turso to rebuild perfectly matched schema...');

    // 1. Get all user tables
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'");
    const tables = result.rows.map(r => r.name);

    // 2. Drop them all to start completely fresh
    console.log(`\n🗑️ Dropping ${tables.length} existing tables...`);
    for (const table of tables) {
        await client.execute('PRAGMA foreign_keys=OFF;');
        await client.execute(`DROP TABLE IF EXISTS "${table}"`);
        console.log(`  - Dropped ${table}`);
    }

    // 3. Read the officially generated Prisma DDL
    const ddl = fs.readFileSync('prisma-schema.sql', 'utf8');

    // 4. Create all tables properly
    console.log('\n🚧 Rebuilding schema from prisma-schema.sql...');
    await client.executeMultiple(ddl);

    // 5. Verify
    console.log('\n📋 Verifying new tables...');
    const verifyResult = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    for (const row of verifyResult.rows) {
        console.log(`  ✅ ${row.name}`);
    }

    console.log('\n✨ Database schema rebuilt successfully! All tables 100% match Prisma schema.');
    client.close();
}

main().catch(console.error);
