import Link from 'next/link';
import { CreditCard, Bell, PieChart, Smartphone, ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            MySubs
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              무료로 시작
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            내 모든 구독을
            <br />
            <span className="text-blue-600">한눈에</span> 관리하세요
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            넷플릭스, 유튜브, 스포티파이... 매달 얼마를 쓰고 있는지 알고 계신가요?
            <br />
            MySubs로 숨겨진 지출을 찾고, 불필요한 구독을 정리하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              무료로 시작하기
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-lg"
            >
              로그인
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          왜 MySubs인가요?
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              한눈에 보는 지출
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              월간, 연간 구독 지출을 한눈에 파악하세요. 숨겨진 지출을 찾아드립니다.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center mb-4">
              <Bell className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              결제일 알림
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              다가오는 결제일을 미리 알려드려요. 예상치 못한 지출을 방지하세요.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4">
              <PieChart className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              카테고리 분석
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              스트리밍, 음악, 생산성 도구 등 카테고리별로 지출을 분석해보세요.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              어디서나 접근
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              PC, 태블릿, 스마트폰 어디서든 내 구독 정보에 접근하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          심플한 가격
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          필요한 만큼만 사용하세요
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border-2 border-gray-100 dark:border-gray-700">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              무료
            </h4>
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
              href="/auth/signup"
              className="block w-full py-3 text-center border-2 border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              무료로 시작
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-blue-600 rounded-2xl p-8 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-amber-900 text-sm font-semibold rounded-full">
              인기
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">
              프로
            </h4>
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
                결제일 알림
              </li>
              <li className="flex items-center gap-2 text-blue-100">
                <Check size={20} className="text-white" />
                월간 리포트
              </li>
              <li className="flex items-center gap-2 text-blue-100">
                <Check size={20} className="text-white" />
                데이터 내보내기
              </li>
            </ul>
            <Link
              href="/pricing"
              className="block w-full py-3 text-center bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              프로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            지금 시작하세요
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            가입은 30초, 구독 정리는 평생의 절약
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            무료로 시작하기
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 dark:text-gray-400">
              MySubs - 구독 관리의 시작
            </p>
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white">이용약관</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white">개인정보처리방침</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white">문의하기</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
