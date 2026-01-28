import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Supabase Admin 클라이언트 (서비스 롤 키 필요)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 이벤트 처리
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        // 사용자를 프로로 업그레이드
        await supabaseAdmin
          .from('user_profiles')
          .upsert({
            id: userId,
            is_pro: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
          });

        console.log(`User ${userId} upgraded to Pro`);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // 구독 상태 업데이트
      const status = subscription.status;
      const isPro = status === 'active' || status === 'trialing';

      await supabaseAdmin
        .from('user_profiles')
        .update({
          is_pro: isPro,
          subscription_status: status,
          subscription_end_date: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
        })
        .eq('stripe_customer_id', customerId);

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // 구독 취소 - 프로 해제
      await supabaseAdmin
        .from('user_profiles')
        .update({
          is_pro: false,
          subscription_status: 'canceled',
        })
        .eq('stripe_customer_id', customerId);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
