import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBillingReminderEmail } from '@/lib/email';

// Supabase Admin 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 매일 아침 실행 - 3일 이내 결제 예정 구독 알림
export async function GET(request: Request) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const currentDay = today.getDate();

    // 모든 활성 사용자의 구독 가져오기
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('Failed to list users:', usersError);
      return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
    }

    let emailsSent = 0;
    let errors: string[] = [];

    for (const user of users.users) {
      if (!user.email) continue;

      // Pro 사용자만 알림 발송 (Pro 전용 기능)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single();

      if (!profile?.is_pro) continue;

      // 사용자의 활성 구독 가져오기
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (subsError || !subscriptions?.length) continue;

      // 3일 이내 결제 예정인 구독 필터링
      const upcomingSubscriptions = subscriptions.filter(sub => {
        const billingDay = sub.billing_day;
        let daysUntil = billingDay - currentDay;

        // 다음 달로 넘어가는 경우 처리
        if (daysUntil < 0) {
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          daysUntil = daysInMonth - currentDay + billingDay;
        }

        return daysUntil >= 0 && daysUntil <= 3;
      });

      if (upcomingSubscriptions.length === 0) continue;

      // 이메일 발송
      try {
        await sendBillingReminderEmail(user.email, {
          userName: user.email.split('@')[0],
          subscriptions: upcomingSubscriptions.map(sub => {
            const billingDay = sub.billing_day;
            let daysUntil = billingDay - currentDay;
            if (daysUntil < 0) {
              const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
              daysUntil = daysInMonth - currentDay + billingDay;
            }

            return {
              name: sub.name,
              price: sub.price,
              currency: sub.currency,
              billingDay: sub.billing_day,
              daysUntil,
            };
          }),
        });
        emailsSent++;
      } catch (err) {
        errors.push(`Failed to send email to ${user.email}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Billing reminder cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
