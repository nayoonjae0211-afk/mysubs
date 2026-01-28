import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTrialEndingEmail } from '@/lib/email';

// Supabase Admin 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 매일 실행 - 무료 체험 종료 3일 전 알림
export async function GET(request: Request) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();

    // 모든 활성 사용자 가져오기
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('Failed to list users:', usersError);
      return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
    }

    let emailsSent = 0;
    let errors: string[] = [];

    for (const user of users.users) {
      if (!user.email) continue;

      // 무료 체험 중인 구독 가져오기
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_trial', true)
        .not('trial_end_date', 'is', null);

      if (subsError || !subscriptions?.length) continue;

      for (const sub of subscriptions) {
        const trialEndDate = new Date(sub.trial_end_date);
        const diffTime = trialEndDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 3일, 1일 전에 알림
        if (daysLeft === 3 || daysLeft === 1) {
          try {
            await sendTrialEndingEmail(user.email, {
              userName: user.email.split('@')[0],
              subscriptionName: sub.name,
              trialEndDate: trialEndDate.toLocaleDateString('ko-KR'),
              daysLeft,
              price: sub.price,
              currency: sub.currency,
            });
            emailsSent++;
          } catch (err) {
            errors.push(`Failed to send trial email for ${sub.name} to ${user.email}: ${err}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Trial reminder cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
