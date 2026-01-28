import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
// Stripe Checkout Session API

export async function POST(request: Request) {
  try {
    // 환경변수 디버그
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;

    console.log('ENV Check:', {
      hasSecretKey: !!secretKey,
      secretKeyPrefix: secretKey?.substring(0, 10),
      hasPriceId: !!priceId,
      priceIdPrefix: priceId?.substring(0, 10),
    });

    if (!secretKey) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY 환경변수가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
      return NextResponse.json(
        { error: `잘못된 STRIPE_SECRET_KEY 형식: ${secretKey.substring(0, 10)}...` },
        { status: 500 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'STRIPE_PRICE_ID 환경변수가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const stripe = getStripe();
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/[^/]*$/, '') || '';

    console.log('Creating checkout session for user:', user.id);

    // Checkout 세션 생성
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
      },
    });

    console.log('Checkout session created:', session.id);

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error);

    // 더 자세한 에러 정보
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `결제 세션 생성 실패: ${message}` },
      { status: 500 }
    );
  }
}
