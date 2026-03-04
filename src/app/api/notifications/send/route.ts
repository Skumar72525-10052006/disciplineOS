import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'sonukumarpaw@gmail.com';

// Determine which notification to send based on current IST time
function getNotificationType(): { subject: string; html: string } | null {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const hour = istTime.getUTCHours();

    if (hour >= 7 && hour < 9) {
        return {
            subject: '🌅 Good Morning! Start Your Day Strong — DisciplineOS',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2a2a4a;">
                    <div style="padding: 32px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🌅</div>
                        <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 8px 0;">Good Morning, Warrior!</h1>
                        <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                            A new day, a new chance to level up. Your habits are waiting — don't break the chain!
                        </p>
                        <div style="background: #1e1e3f; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #313163;">
                            <p style="color: #818cf8; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">TODAY'S MISSION</p>
                            <p style="color: #e2e8f0; font-size: 14px; margin: 0;">✅ Complete your daily habits<br>📋 Check your task list<br>📚 Log study sessions<br>⚡ Track your energy</p>
                        </div>
                        <a href="https://disciplineos-three.vercel.app/war-room" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                            Open War Room →
                        </a>
                    </div>
                    <div style="background: #0a0a1a; padding: 16px; text-align: center;">
                        <p style="color: #475569; font-size: 12px; margin: 0;">DisciplineOS — Your Personal Command Center</p>
                    </div>
                </div>
            `,
        };
    }

    if (hour >= 13 && hour < 15) {
        return {
            subject: '⚡ Midday Check-In — How\'s Your Progress? — DisciplineOS',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2a2a4a;">
                    <div style="padding: 32px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">⚡</div>
                        <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 8px 0;">Midday Power Check!</h1>
                        <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                            Half the day is done. Are you on track? Keep the momentum going — every small win counts!
                        </p>
                        <div style="background: #1e1e3f; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #313163;">
                            <p style="color: #f59e0b; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">QUICK CHECK</p>
                            <p style="color: #e2e8f0; font-size: 14px; margin: 0;">🔥 How many habits done?<br>📝 Any pending tasks?<br>⏱️ Started your Pomodoro?<br>💪 Keep the chain alive!</p>
                        </div>
                        <a href="https://disciplineos-three.vercel.app/habits" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                            Check Habits →
                        </a>
                    </div>
                    <div style="background: #0a0a1a; padding: 16px; text-align: center;">
                        <p style="color: #475569; font-size: 12px; margin: 0;">DisciplineOS — Your Personal Command Center</p>
                    </div>
                </div>
            `,
        };
    }

    if (hour >= 20 && hour < 22) {
        return {
            subject: '🌙 End of Day — Did You Complete Your Habits? — DisciplineOS',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2a2a4a;">
                    <div style="padding: 32px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🌙</div>
                        <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 8px 0;">Day's Almost Over!</h1>
                        <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                            Before you rest — make sure everything is logged. Tomorrow's success starts with tonight's discipline.
                        </p>
                        <div style="background: #1e1e3f; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #313163;">
                            <p style="color: #10b981; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">NIGHT ROUTINE</p>
                            <p style="color: #e2e8f0; font-size: 14px; margin: 0;">✅ Mark all habits as done<br>📊 Log study time & sessions<br>⚡ Record energy level<br>🎯 Review tomorrow's plan</p>
                        </div>
                        <a href="https://disciplineos-three.vercel.app/analytics" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                            View Analytics →
                        </a>
                    </div>
                    <div style="background: #0a0a1a; padding: 16px; text-align: center;">
                        <p style="color: #475569; font-size: 12px; margin: 0;">DisciplineOS — Your Personal Command Center</p>
                    </div>
                </div>
            `,
        };
    }

    return null;
}

// GET handler for Vercel Cron Jobs
export async function GET(request: Request) {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Also allow without auth for testing
        const url = new URL(request.url);
        if (!url.searchParams.get('test')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    const notification = getNotificationType();

    if (!notification) {
        return NextResponse.json({ message: 'Not a notification hour, skipping.' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'DisciplineOS <onboarding@resend.dev>',
            to: [NOTIFICATION_EMAIL],
            subject: notification.subject,
            html: notification.html,
        });

        if (error) {
            console.error('Email send error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            emailId: data?.id,
            sentTo: NOTIFICATION_EMAIL,
            type: notification.subject,
        });
    } catch (error) {
        console.error('Failed to send email:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}

// POST handler for manual test sends
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const type = body.type || 'morning';

        let notification;
        if (type === 'morning') {
            notification = {
                subject: '🌅 Good Morning! Start Your Day Strong — DisciplineOS',
                html: `<div style="font-family: Arial; padding: 24px; text-align: center;"><h1>🌅 Good Morning!</h1><p>This is a test notification from DisciplineOS.</p><a href="https://disciplineos-three.vercel.app/war-room" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Open DisciplineOS</a></div>`,
            };
        } else if (type === 'midday') {
            notification = {
                subject: '⚡ Midday Check-In — DisciplineOS',
                html: `<div style="font-family: Arial; padding: 24px; text-align: center;"><h1>⚡ Midday Check!</h1><p>This is a test notification from DisciplineOS.</p><a href="https://disciplineos-three.vercel.app/habits" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Check Habits</a></div>`,
            };
        } else {
            notification = {
                subject: '🌙 End of Day — DisciplineOS',
                html: `<div style="font-family: Arial; padding: 24px; text-align: center;"><h1>🌙 Night Check!</h1><p>This is a test notification from DisciplineOS.</p><a href="https://disciplineos-three.vercel.app/analytics" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Analytics</a></div>`,
            };
        }

        const { data, error } = await resend.emails.send({
            from: 'DisciplineOS <onboarding@resend.dev>',
            to: [NOTIFICATION_EMAIL],
            subject: notification.subject,
            html: notification.html,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, emailId: data?.id });
    } catch (error) {
        console.error('Failed to send test email:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
