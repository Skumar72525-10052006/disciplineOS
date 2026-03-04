// This API route has been replaced by email notifications.
// Push notification subscriptions are no longer used.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({ message: 'Push subscriptions are deprecated. Email notifications are now used.' }, { status: 410 });
}
