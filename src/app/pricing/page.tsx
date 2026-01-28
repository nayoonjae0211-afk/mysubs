'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    }
    checkAuth();
  }, [supabase]);

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || '결제 페이지로 이동할 수 없습니다.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft size={20} />
            <span>홈으로</span>
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              대시보드
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              로그인
            </Link>
          )}
        </nav>
      </header>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
          심플한 가격
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          필요한 만큼만 사용하세요. 언제든 취소 가능합니다.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border-2 border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              무료
            </h2>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">₩0</span>
              <span className="text-gray-500">/월</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Check size={20} className="text-green-500" />
                구독 5개까지 등록
              </li>
              <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Check size={20} className="text-green-500" />
                기본 대시보드
              </li>
              <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Check size={20} className="text-green-500" />
                카테고리 분석
              </li>
            </ul>
            <Link
              href={isLoggedIn ? '/dashboard' : '/auth/signup'}
              className="block w-full py-3 text-center border-2 border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {isLoggedIn ? '대시보드로' : '무료로 시작'}
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-blue-600 rounded-2xl p-8 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-amber-900 text-sm font-semibold rounded-full">
              추천
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              프로
            </h2>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">₩4,900</span>
              <span className="text-blue-200">/월</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-blue-100">
                <Check size={20} className="text-white" />
                무제한 구독 등록
              </li>
              <li className="flex items-center gap-2 text-blue-100">
                <Check size={20} className="text-white" />
                결제일 이메일 알림
              </li>
              <li className="flex items-center gap-2 text-blue-100">
                <Check size={20} className="text-white" />
                월간 리포트
              </li>
              <li className="flex items-center gap-2 text-blue-100">
                <Check size={20} className="text-white" />
                데이터 내보내기
              </li>
              <li className="flex items-center gap-2 text-blue-100">
                <Check size={20} className="text-white" />
                우선 지원
              </li>
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3 text-center bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  처리 중...
                </>
              ) : (
                '프로 시작하기'
              )}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-20">
          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            자주 묻는 질문
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                언제든 취소할 수 있나요?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                네, 언제든지 취소할 수 있습니다. 취소해도 결제 기간 동안은 프로 기능을 사용할 수 있습니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                결제는 어떻게 처리되나요?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Stripe를 통해 안전하게 결제됩니다. 카드 정보는 저희 서버에 저장되지 않습니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                환불 정책이 있나요?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                첫 결제 후 7일 이내 불만족 시 전액 환불해드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
