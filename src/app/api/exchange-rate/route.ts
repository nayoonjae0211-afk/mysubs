import { NextResponse } from 'next/server';

// 환율 캐시 (1시간 유지)
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1시간

export async function GET() {
  try {
    // 캐시된 환율이 있고 아직 유효하면 반환
    if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        rate: cachedRate.rate,
        cached: true,
        updatedAt: new Date(cachedRate.timestamp).toISOString(),
      });
    }

    // 무료 환율 API 사용 (exchangerate-api.com)
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();
    const rate = data.rates.KRW;

    // 캐시 업데이트
    cachedRate = { rate, timestamp: Date.now() };

    return NextResponse.json({
      rate,
      cached: false,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Exchange rate API error:', error);

    // 오류 시 기본값 반환
    return NextResponse.json({
      rate: 1350,
      cached: false,
      error: 'Failed to fetch, using default rate',
    });
  }
}
