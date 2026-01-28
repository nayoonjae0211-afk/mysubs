'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Wallet, TrendingUp, Calendar, CreditCard, LogOut, Loader2, Crown, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatNumber, getBillingDateText } from '@/lib/utils';
import { CATEGORY_LABELS, CATEGORY_COLORS, Subscription, SubscriptionCategory } from '@/types/subscription';
import AddSubscriptionModal from '@/components/subscription/AddSubscriptionModal';
import SubscriptionCardDB from '@/components/subscription/SubscriptionCardDB';
import type { User } from '@supabase/supabase-js';

const FREE_LIMIT = 5; // 무료 사용자 구독 제한

// DB에서 가져온 구독을 프론트엔드 타입으로 변환
interface DBSubscription {
  id: string;
  user_id: string;
  name: string;
  price: number;
  currency: 'KRW' | 'USD';
  billing_cycle: 'monthly' | 'yearly' | 'weekly';
  billing_day: number;
  category: SubscriptionCategory;
  start_date: string;
  is_active: boolean;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

function dbToFrontend(db: DBSubscription): Subscription {
  return {
    id: db.id,
    name: db.name,
    price: db.price,
    currency: db.currency,
    billingCycle: db.billing_cycle,
    billingDay: db.billing_day,
    category: db.category,
    startDate: db.start_date,
    isActive: db.is_active,
    memo: db.memo || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // 사용자 및 구독 데이터 로드
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      // 프로 상태 확인
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single();

      if (profile) {
        setIsPro(profile.is_pro);
      }

      // 구독 목록 로드
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSubscriptions(data.map(dbToFrontend));
      }

      setLoading(false);

      // 결제 성공 메시지
      if (searchParams.get('success') === 'true') {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    }

    loadData();
  }, [router, supabase, searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleAddSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    // 무료 사용자 제한 체크
    if (!isPro && subscriptions.length >= FREE_LIMIT) {
      alert(`무료 플랜은 최대 ${FREE_LIMIT}개까지만 등록할 수 있습니다.\n프로로 업그레이드하면 무제한으로 이용 가능합니다.`);
      router.push('/pricing');
      return;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        name: subscription.name,
        price: subscription.price,
        currency: subscription.currency,
        billing_cycle: subscription.billingCycle,
        billing_day: subscription.billingDay,
        category: subscription.category,
        start_date: subscription.startDate,
        is_active: subscription.isActive,
        memo: subscription.memo,
      })
      .select()
      .single();

    if (!error && data) {
      setSubscriptions((prev) => [dbToFrontend(data), ...prev]);
    }
  };

  const handleToggleActive = async (id: string) => {
    const subscription = subscriptions.find((s) => s.id === id);
    if (!subscription) return;

    const { error } = await supabase
      .from('subscriptions')
      .update({ is_active: !subscription.isActive })
      .eq('id', id);

    if (!error) {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (!error) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // 계산 함수들
  const calculateMonthlyTotal = () => {
    return subscriptions
      .filter((sub) => sub.isActive)
      .reduce((total, sub) => {
        let monthlyPrice = sub.price;
        if (sub.currency === 'USD') monthlyPrice *= 1350;
        if (sub.billingCycle === 'yearly') monthlyPrice /= 12;
        else if (sub.billingCycle === 'weekly') monthlyPrice *= 4;
        return total + monthlyPrice;
      }, 0);
  };

  const getUpcomingBillings = () => {
    const today = new Date();
    const currentDay = today.getDate();

    return subscriptions
      .filter((sub) => sub.isActive)
      .filter((sub) => {
        const daysUntil = sub.billingDay >= currentDay
          ? sub.billingDay - currentDay
          : (30 - currentDay) + sub.billingDay;
        return daysUntil <= 7;
      })
      .sort((a, b) => a.billingDay - b.billingDay);
  };

  const activeSubscriptions = subscriptions.filter((s) => s.isActive);
  const monthlyTotal = calculateMonthlyTotal();
  const yearlyTotal = monthlyTotal * 12;
  const upcomingBillings = getUpcomingBillings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 결제 성공 메시지 */}
      {showSuccessMessage && (
        <div className="bg-green-500 text-white text-center py-3 px-4">
          <Sparkles className="inline mr-2" size={20} />
          프로 플랜으로 업그레이드되었습니다! 이제 무제한으로 이용하세요.
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  MySubs
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              {isPro && (
                <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                  <Crown size={14} />
                  PRO
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isPro && (
                <Link
                  href="/pricing"
                  className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  <Crown size={16} />
                  <span className="hidden sm:inline">프로 업그레이드</span>
                </Link>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">구독 추가</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="로그아웃"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Wallet className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">월 구독료</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(monthlyTotal)}
              <span className="text-lg font-normal text-gray-500">원</span>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">연간 지출</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(yearlyTotal)}
              <span className="text-lg font-normal text-gray-500">원</span>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <CreditCard className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">활성 구독</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {activeSubscriptions.length}
              {!isPro && (
                <span className="text-lg font-normal text-gray-500">/{FREE_LIMIT}개</span>
              )}
              {isPro && (
                <span className="text-lg font-normal text-gray-500">개</span>
              )}
            </p>
          </div>
        </div>

        {/* 무료 사용자 업그레이드 유도 */}
        {!isPro && subscriptions.length >= FREE_LIMIT - 1 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown size={24} />
                <div>
                  <p className="font-semibold">프로로 업그레이드하세요</p>
                  <p className="text-sm text-blue-100">무제한 구독 등록 + 결제일 알림 + 월간 리포트</p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                업그레이드
              </Link>
            </div>
          </div>
        )}

        {/* Upcoming Billings */}
        {upcomingBillings.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="text-amber-600" size={20} />
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                다가오는 결제
              </h3>
            </div>
            <div className="space-y-2">
              {upcomingBillings.slice(0, 3).map((sub) => (
                <div key={sub.id} className="flex justify-between items-center text-sm">
                  <span className="text-amber-700 dark:text-amber-300">{sub.name}</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {getBillingDateText(sub.billingDay)} · {formatNumber(sub.price)}원
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription List */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            내 구독 목록
          </h2>

          {subscriptions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                아직 등록된 구독이 없어요
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                구독 서비스를 추가하고 지출을 관리해보세요
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>첫 구독 추가하기</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <SubscriptionCardDB
                  key={subscription.id}
                  subscription={subscription}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Category Summary */}
        {subscriptions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              카테고리별 지출
            </h3>
            <div className="space-y-3">
              {Object.entries(
                subscriptions.reduce((acc, sub) => {
                  if (!sub.isActive) return acc;
                  let price = sub.price;
                  if (sub.currency === 'USD') price *= 1350;
                  if (sub.billingCycle === 'yearly') price /= 12;
                  acc[sub.category] = (acc[sub.category] || 0) + price;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`} />
                    <span className="flex-1 text-gray-700 dark:text-gray-300">
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatNumber(amount)}원
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSubscription}
      />
    </div>
  );
}
