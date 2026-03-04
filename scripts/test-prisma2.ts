import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
    console.log('🧪 Testing Prisma App Registration...');

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
    console.log('\n  -> Creating a test Subject with all new fields...');
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
    console.log('\n  -> Cleaning up test data...');
    await prisma.habit.delete({ where: { id: habit.id } });
    await prisma.subject.delete({ where: { id: subject.id } });
    console.log('  ✅ Cleanup complete.');

    console.log('\n🎉 Prisma App Connection is 100% working and schema matches!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
