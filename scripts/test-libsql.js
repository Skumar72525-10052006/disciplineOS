const { createClient } = require('@libsql/client');

async function test() {
    const url = process.env.TURSO_DATABASE_URL || 'libsql://disciplineos-skumar72525-10052006.aws-ap-south-1.turso.io';
    const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI1MzUxMDQsImlkIjoiMDE5Y2IzNTEtZmUwMS03NzJkLWIzNDQtYTZkMDJmOTAzNDgyIiwicmlkIjoiNTY5NzYxMjEtNWZkMC00N2JmLWIxOGUtYzczYzA4NGYzODI2In0.uLZf84z40SvQO0YSjuAAEcjrU2e6o0l051mEFoiW5MPXOhsE7Q1B9X5dKJpFw2YEwzolQduu_NgXyDIt_xlxBA';

    console.log('Testing LibSQL directly...');
    console.log('URL:', url.substring(0, 20) + '...');

    try {
        const client = createClient({ url, authToken });
        const res = await client.execute('SELECT 1');
        console.log('✅ LibSQL Success:', res.rows[0]);
        client.close();
    } catch (err) {
        console.error('❌ LibSQL Error:', err);
    }
}

test();
