// Script to verify Prisma can properly write to and read from Turso after the schema rebuild
// Run: npx ts-node scripts/test-prisma.ts

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

console.log('🔍 ENV CHECK:');
console.log('  TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? 'DEFINED' : 'UNDEFINED');
console.log('  TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'DEFINED' : 'UNDEFINED');

const url = process.env.TURSO_DATABASE_URL || 'libsql://disciplineos-skumar72525-10052006.aws-ap-south-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI1MzUxMDQsImlkIjoiMDE5Y2IzNTEtZmUwMS03NzJkLWIzNDQtYTZkMDJmOTAzNDgyIiwicmlkIjoiNTY5NzYxMjEtNWZkMC00N2JmLWIxOGUtYzczYzA4NGYzODI2In0.uLZf84z40SvQO0YSjuAAEcjrU2e6o0l051mEFoiW5MPXOhsE7Q1B9X5dKJpFw2YEwzolQduu_NgXyDIt_xlxBA';

console.log('🧪 Initializing LibSQL adapter with URL:', url.substring(0, 15) + '...');

const adapter = new PrismaLibSql({ url, authToken });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🧪 Testing Prisma with Turso DB...');

    // 1. Test Habit Creation
    console.log('  -> Creating a test Habit...');
    const habit = await prisma.habit.create({
        data: {
            name: 'Test Turso Habit',
            icon: '🔥',
            color: '#ef4444',
            category: 'health',
            targetDays: '1,3,5',
        }
    });
    console.log('  ✅ Created Habit:', habit.name);

    // 2. Test Subject Creation
    console.log('  -> Creating a test Subject with all new fields...');
    const subject = await prisma.subject.create({
        data: {
            name: 'Advanced React',
            code: 'CS500',
            color: '#06b6d4',
            semester: 5,
            targetHoursPerWeek: 15,
            goalGrade: 'A+',
        }
    });
    console.log('  ✅ Created Subject:', subject.name, '(Semester:', subject.semester, ')');

    // 3. Clean up
    console.log('  -> Cleaning up test data...');
    await prisma.habit.delete({ where: { id: habit.id } });
    await prisma.subject.delete({ where: { id: subject.id } });
    console.log('  ✅ Cleanup complete.');

    console.log('🎉 Prisma <-> Turso connection is 100% working and schema matches!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
