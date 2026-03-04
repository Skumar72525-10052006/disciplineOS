import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'libsql://disciplineos-skumar72525-10052006.aws-ap-south-1.turso.io',
    authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI1MzUxMDQsImlkIjoiMDE5Y2IzNTEtZmUwMS03NzJkLWIzNDQtYTZkMDJmOTAzNDgyIiwicmlkIjoiNTY5NzYxMjEtNWZkMC00N2JmLWIxOGUtYzczYzA4NGYzODI2In0.uLZf84z40SvQO0YSjuAAEcjrU2e6o0l051mEFoiW5MPXOhsE7Q1B9X5dKJpFw2YEwzolQduu_NgXyDIt_xlxBA',
});

const alters = [
    `ALTER TABLE "Subject" ADD COLUMN "semester" INTEGER;`,
    `ALTER TABLE "Subject" ADD COLUMN "targetHoursPerWeek" INTEGER NOT NULL DEFAULT 5;`,
    `ALTER TABLE "Subject" ADD COLUMN "goalGrade" TEXT;`,
    `ALTER TABLE "Subject" ADD COLUMN "lastActivityDate" TEXT;`,
    `ALTER TABLE "Subject" ADD COLUMN "isActive" INTEGER NOT NULL DEFAULT 1;`
];

async function main() {
    console.log('🔌 Connecting to Turso to add missing Subject columns...');

    for (const sql of alters) {
        try {
            await client.execute(sql);
            console.log(`  ✅ Added column: ${sql.split('"')[3]}`);
        } catch (err) {
            // Might fail if they already exist, which is fine
            if (err.message.includes('duplicate column name')) {
                console.log(`  ⏭️ Column ${sql.split('"')[3]} already exists, skipping.`);
            } else {
                console.error(`  ❌ Failed: ${err.message}`);
            }
        }
    }

    client.close();
}

main().catch(console.error);
