import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMonthlyReportEmail } from '@/lib/email';

const CATEGORY_NAMES: Record<string, string> = {
  streaming: '스트리밍',
  music: '음악',
  productivity: '생산성',
  gaming: '게임',
  shopping: '쇼핑',
  news: '뉴스',
  fitness: '피트니스',
  cloud: '클라우드',
  other: '기타',
};

// Supabase Admin 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 매월 1일 실행 - 월간 리포트 발송
export async function GET(request: Request) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
    const monthName = `${today.getFullYear()}년 ${monthNames[lastMonth]}`;

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

      // Pro 사용자만 리포트 발송 (Pro 전용 기능)
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

      // 통계 계산
      const USD_TO_KRW = 1350;

      let totalKRW = 0;
      let totalUSD = 0;
      const categoryTotals: Record<string, number> = {};

      for (const sub of subscriptions) {
        let monthlyPrice = sub.price;

        // 결제 주기에 따른 월간 금액 계산
        if (sub.billing_cycle === 'yearly') {
          monthlyPrice = sub.price / 12;
        } else if (sub.billing_cycle === 'weekly') {
          monthlyPrice = sub.price * 4;
        }

        if (sub.currency === 'USD') {
          totalUSD += monthlyPrice;
          monthlyPrice = monthlyPrice * USD_TO_KRW;
        } else {
          totalKRW += monthlyPrice;
        }

        // 카테고리별 집계 (KRW로 통일)
        const category = CATEGORY_NAMES[sub.category] || '기타';
        categoryTotals[category] = (categoryTotals[category] || 0) + monthlyPrice;
      }

      const categoryBreakdown = Object.entries(categoryTotals)
        .map(([category, amount]) => ({ category, amount: Math.round(amount) }))
        .sort((a, b) => b.amount - a.amount);

      const totalInKRW = totalKRW + (totalUSD * USD_TO_KRW);

      // 이메일 발송
      try {
        await sendMonthlyReportEmail(user.email, {
          userName: user.email.split('@')[0],
          month: monthName,
          totalKRW: Math.round(totalKRW),
          totalUSD: Math.round(totalUSD * 100) / 100,
          subscriptionCount: subscriptions.length,
          categoryBreakdown,
          upcomingTotal: Math.round(totalInKRW),
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
    console.error('Monthly report cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
