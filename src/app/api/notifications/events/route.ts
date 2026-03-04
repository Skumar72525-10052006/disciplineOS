import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'sonukumarpaw@gmail.com';

function generateEventEmailHTML(events: { title: string; startTime: string; endTime: string; slotType: string; location: string | null; scheduleDate: string }[]) {
    const typeEmojis: Record<string, string> = {
        class: '📚', study: '🎯', work: '💼', activity: '🏃', break: '☕'
    };
    const typeColors: Record<string, string> = {
        class: '#58a6ff', study: '#a855f7', work: '#f97316', activity: '#39d353', break: '#6e7681'
    };

    const eventCards = events.map(e => {
        const emoji = typeEmojis[e.slotType] || '📌';
        const color = typeColors[e.slotType] || '#6e7681';
        const dateObj = new Date(e.scheduleDate + 'T00:00:00');
        const dateLabel = dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

        return `
            <div style="background: #1e1e3f; border-radius: 12px; padding: 18px; margin-bottom: 12px; border-left: 4px solid ${color}; border: 1px solid #313163;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 24px;">${emoji}</span>
                    <div>
                        <div style="font-size: 16px; font-weight: 700; color: ${color};">${e.title}</div>
                        <div style="font-size: 13px; color: #94a3b8;">${e.startTime} — ${e.endTime} • ${dateLabel}${e.location ? ` • ${e.location}` : ''}</div>
                    </div>
                </div>
            </div>`;
    }).join('');

    return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2a2a4a;">
            <div style="padding: 32px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 12px;">⏰</div>
                <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 8px 0;">Upcoming Event${events.length > 1 ? 's' : ''} — 1 Hour Away!</h1>
                <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">
                    You have ${events.length} event${events.length > 1 ? 's' : ''} starting soon. Get ready!
                </p>
                <div style="text-align: left;">
                    ${eventCards}
                </div>
                <a href="https://disciplineos-three.vercel.app/schedule" style="display: inline-block; margin-top: 16px; background: linear-gradient(135deg, #d29922, #f59e0b); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                    View Schedule →
                </a>
            </div>
            <div style="background: #0a0a1a; padding: 16px; text-align: center;">
                <p style="color: #475569; font-size: 12px; margin: 0;">DisciplineOS — Your Personal Command Center</p>
            </div>
        </div>`;
}

// GET handler — called by external cron job every 10–15 minutes
export async function GET(request: Request) {
    // Auth check
    const authHeader = request.headers.get('authorization');
    const url = new URL(request.url);
    const isTest = url.searchParams.get('test');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !isTest) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get current time in IST
        const now = new Date();
        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + istOffsetMs);
        const istHour = istNow.getUTCHours();
        const istMinute = istNow.getUTCMinutes();

        // Today's date string in IST
        const todayIST = `${istNow.getUTCFullYear()}-${String(istNow.getUTCMonth() + 1).padStart(2, '0')}-${String(istNow.getUTCDate()).padStart(2, '0')}`;

        // The time 1 hour from now
        const oneHourLaterMinutes = istHour * 60 + istMinute + 60;

        // Find schedule slots for today that:
        //   1. Start within the next 45–75 minutes (window to catch ~1 hour before)
        //   2. Have NOT been notified yet
        const todaySlots = await prisma.scheduleSlot.findMany({
            where: {
                scheduleDate: todayIST,
                notifiedAt: null,
            },
            orderBy: { startTime: 'asc' },
        });

        // Filter: events starting approximately 1 hour from now (within 45-75 min window)
        const upcomingEvents = todaySlots.filter(slot => {
            const [h, m] = slot.startTime.split(':').map(Number);
            const slotMinutes = h * 60 + (m || 0);
            const diff = slotMinutes - (istHour * 60 + istMinute);
            // Send notification if event is 30–75 minutes away (captures the 1-hour mark)
            return diff >= 30 && diff <= 75;
        });

        if (upcomingEvents.length === 0) {
            return NextResponse.json({
                message: 'No upcoming events to notify about',
                currentIST: `${String(istHour).padStart(2, '0')}:${String(istMinute).padStart(2, '0')}`,
                todaySlots: todaySlots.length,
                checked: todayIST,
            });
        }

        // Send email
        const eventDetails = upcomingEvents.map(e => ({
            title: e.title,
            startTime: e.startTime,
            endTime: e.endTime,
            slotType: e.slotType,
            location: e.location,
            scheduleDate: e.scheduleDate || todayIST,
        }));

        const subjects = upcomingEvents.map(e => e.title).join(', ');
        const { data, error } = await resend.emails.send({
            from: 'DisciplineOS <onboarding@resend.dev>',
            to: [NOTIFICATION_EMAIL],
            subject: `⏰ Reminder: ${subjects} — Starting in ~1 hour!`,
            html: generateEventEmailHTML(eventDetails),
        });

        if (error) {
            console.error('Event notification email error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Mark these events as notified so we don't send again
        await prisma.scheduleSlot.updateMany({
            where: { id: { in: upcomingEvents.map(e => e.id) } },
            data: { notifiedAt: new Date() },
        });

        return NextResponse.json({
            success: true,
            emailId: data?.id,
            notifiedEvents: upcomingEvents.map(e => ({ title: e.title, startTime: e.startTime })),
            sentTo: NOTIFICATION_EMAIL,
            currentIST: `${String(istHour).padStart(2, '0')}:${String(istMinute).padStart(2, '0')}`,
        });

    } catch (err: any) {
        console.error('Event reminder error:', err);
        return NextResponse.json({ error: 'Failed to process event reminders', details: err?.message || String(err) }, { status: 500 });
    }
}
