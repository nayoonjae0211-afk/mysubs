'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Plus, Wallet, TrendingUp, Calendar, CreditCard, LogOut, Loader2, Crown, Sparkles,
  RefreshCw, PieChart, Settings, Search, SlidersHorizontal, Sun, Moon, Download,
  FileSpreadsheet, FileJson, Bell, BarChart3, GripVertical, Tag
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatNumber, getBillingDateText } from '@/lib/utils';
import { CATEGORY_LABELS, CATEGORY_COLORS, Subscription, SubscriptionCategory } from '@/types/subscription';
import AddSubscriptionModal from '@/components/subscription/AddSubscriptionModal';
import SubscriptionCardDB from '@/components/subscription/SubscriptionCardDB';
import DraggableSubscriptionList from '@/components/subscription/DraggableSubscriptionList';
import { useTheme } from '@/components/ThemeProvider';
import { exportToCSV, exportToExcel, exportToJSON } from '@/lib/export';
import type { User } from '@supabase/supabase-js';

// 차트는 클라이언트에서만 로드
const SpendingChart = dynamic(() => import('@/components/charts/SpendingChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  ),
});

const FREE_LIMIT = 5;

function DashboardContent() {
  const searchParams = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  return showSuccessMessage ? (
    <div className="bg-green-500 text-white text-center py-3 px-4">
      <Sparkles className="inline mr-2" size={20} />
      프로 플랜으로 업그레이드되었습니다! 이제 무제한으로 이용하세요.
    </div>
  ) : null;
}

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
  tags: string[] | null;
  display_order: number | null;
  annual_price: number | null;
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
    tags: db.tags || undefined,
    displayOrder: db.display_order || undefined,
    annualPrice: db.annual_price || undefined,
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
  const [exchangeRate, setExchangeRate] = useState(1350);
  const [rateLoading, setRateLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'billingDay' | 'custom'>('billingDay');
  const [filterCategory, setFilterCategory] = useState<SubscriptionCategory | 'all'>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [enableDragDrop, setEnableDragDrop] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Pro 사용자 구독 관리 (Stripe Portal)
  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || '구독 관리 페이지를 열 수 없습니다.');
      }
    } catch {
      alert('오류가 발생했습니다.');
    }
  };

  // 환율 가져오기
  const fetchExchangeRate = async () => {
    setRateLoading(true);
    try {
      const response = await fetch('/api/exchange-rate');
      const data = await response.json();
      setExchangeRate(data.rate);
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
    } finally {
      setRateLoading(false);
    }
  };

  // 사용자 및 구독 데이터 로드
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single();

      if (profile) {
        setIsPro(profile.is_pro);
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSubscriptions(data.map(dbToFrontend));
      }

      fetchExchangeRate();
      setLoading(false);
    }

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleAddSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

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
        tags: subscription.tags,
        display_order: subscriptions.length,
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

  // 드래그 앤 드롭 순서 변경
  const handleReorder = async (newOrder: Subscription[]) => {
    setSubscriptions(newOrder);

    // DB에 순서 저장
    const updates = newOrder.map((sub, index) => ({
      id: sub.id,
      display_order: index,
    }));

    for (const update of updates) {
      await supabase
        .from('subscriptions')
        .update({ display_order: update.display_order })
        .eq('id', update.id);
    }
  };

  // 계산 함수들
  const calculateMonthlyTotal = () => {
    return subscriptions
      .filter((sub) => sub.isActive)
      .reduce((total, sub) => {
        let monthlyPrice = sub.price;
        if (sub.currency === 'USD') monthlyPrice *= exchangeRate;
        if (sub.billingCycle === 'yearly') monthlyPrice /= 12;
        else if (sub.billingCycle === 'weekly') monthlyPrice *= 4;
        return total + monthlyPrice;
      }, 0);
  };

  const getCategoryData = () => {
    const categoryTotals = subscriptions
      .filter((sub) => sub.isActive)
      .reduce((acc, sub) => {
        let price = sub.price;
        if (sub.currency === 'USD') price *= exchangeRate;
        if (sub.billingCycle === 'yearly') price /= 12;
        else if (sub.billingCycle === 'weekly') price *= 4;
        acc[sub.category] = (acc[sub.category] || 0) + price;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: monthlyTotal > 0 ? (amount / monthlyTotal) * 100 : 0,
      }));
  };

  // 연간 결제 전환 시 절약 가능액 계산
  const calculatePotentialSavings = () => {
    const monthlySubscriptions = subscriptions.filter(
      (sub) => sub.isActive && sub.billingCycle === 'monthly'
    );

    let potentialSavings = 0;
    monthlySubscriptions.forEach((sub) => {
      let monthlyPrice = sub.price;
      if (sub.currency === 'USD') monthlyPrice *= exchangeRate;
      // 연간 결제 시 평균 20% 할인 가정
      const annualSavings = monthlyPrice * 12 * 0.2;
      potentialSavings += annualSavings;
    });

    return potentialSavings;
  };

  // 현재 연간 결제로 절약 중인 금액
  const calculateCurrentSavings = () => {
    const yearlySubscriptions = subscriptions.filter(
      (sub) => sub.isActive && sub.billingCycle === 'yearly'
    );

    let savings = 0;
    yearlySubscriptions.forEach((sub) => {
      let yearlyPrice = sub.price;
      if (sub.currency === 'USD') yearlyPrice *= exchangeRate;
      const monthlyEquivalent = (yearlyPrice / 12) * 1.2 * 12;
      savings += monthlyEquivalent - yearlyPrice;
    });

    return savings;
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

  // 필터링 및 정렬된 구독 목록
  const getFilteredSubscriptions = () => {
    let filtered = subscriptions.filter((sub) => {
      if (searchQuery && !sub.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterCategory !== 'all' && sub.category !== filterCategory) {
        return false;
      }
      return true;
    });

    if (sortBy !== 'custom') {
      filtered = [...filtered].sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price') {
          const priceA = a.currency === 'USD' ? a.price * exchangeRate : a.price;
          const priceB = b.currency === 'USD' ? b.price * exchangeRate : b.price;
          return priceB - priceA;
        }
        return a.billingDay - b.billingDay;
      });
    }

    return filtered;
  };

  // 모든 태그 수집
  const getAllTags = () => {
    const tags = new Set<string>();
    subscriptions.forEach((sub) => {
      sub.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  };

  const activeSubscriptions = subscriptions.filter((s) => s.isActive);
  const monthlyTotal = calculateMonthlyTotal();
  const yearlyTotal = monthlyTotal * 12;
  const upcomingBillings = getUpcomingBillings();
  const categoryData = getCategoryData();
  const currentSavings = calculateCurrentSavings();
  const potentialSavings = calculatePotentialSavings();
  const filteredSubscriptions = getFilteredSubscriptions();
  const allTags = getAllTags();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Suspense fallback={null}>
        <DashboardContent />
      </Suspense>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  MySubs
                </Link>
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
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={resolvedTheme === 'dark' ? '라이트 모드' : '다크 모드'}
              >
                {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {!isPro && (
                <Link
                  href="/pricing"
                  className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  <Crown size={16} />
                  <span className="hidden sm:inline">프로</span>
                </Link>
              )}

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">구독 추가</span>
              </button>

              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="내보내기"
                >
                  <Download size={20} />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                    <button
                      onClick={() => { exportToCSV(subscriptions, exchangeRate); setShowExportMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FileSpreadsheet size={16} />
                      CSV로 내보내기
                    </button>
                    <button
                      onClick={() => { exportToExcel(subscriptions, exchangeRate); setShowExportMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FileSpreadsheet size={16} />
                      Excel로 내보내기
                    </button>
                    <button
                      onClick={() => { exportToJSON(subscriptions); setShowExportMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FileJson size={16} />
                      JSON으로 내보내기
                    </button>
                  </div>
                )}
              </div>

              {isPro && (
                <>
                  <Link
                    href="/dashboard/settings"
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="알림 설정"
                  >
                    <Bell size={20} />
                  </Link>
                  <button
                    onClick={handleManageSubscription}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="결제 관리"
                  >
                    <Settings size={20} />
                  </button>
                </>
              )}

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
              {!isPro && <span className="text-lg font-normal text-gray-500">/{FREE_LIMIT}개</span>}
              {isPro && <span className="text-lg font-normal text-gray-500">개</span>}
            </p>
          </div>
        </div>

        {/* Savings Cards */}
        {(currentSavings > 0 || potentialSavings > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentSavings > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                    <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      연간 결제로 {formatNumber(currentSavings)}원 절약 중!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      월간 결제 대비 약 20% 할인 적용
                    </p>
                  </div>
                </div>
              </div>
            )}
            {potentialSavings > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                    <Sparkles className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      연간 결제 전환 시 {formatNumber(potentialSavings)}원 절약 가능
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      월간 구독을 연간으로 전환해보세요
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pro Upgrade Banner */}
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
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">다가오는 결제</h3>
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

        {/* Monthly Spending Chart Toggle */}
        {subscriptions.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowChart(!showChart)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4"
            >
              <BarChart3 size={16} />
              {showChart ? '차트 숨기기' : '월별 지출 차트 보기'}
            </button>
            {showChart && (
              <SpendingChart subscriptions={subscriptions} exchangeRate={exchangeRate} />
            )}
          </div>
        )}

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-gray-500" />
              <span className="text-sm text-gray-500">태그</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subscription List */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              내 구독 목록 ({subscriptions.length}개)
            </h2>

            {subscriptions.length > 0 && (
              <div className="flex items-center gap-2">
                {/* Drag Toggle */}
                <button
                  onClick={() => {
                    setEnableDragDrop(!enableDragDrop);
                    if (!enableDragDrop) setSortBy('custom');
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    enableDragDrop
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500'
                  }`}
                  title="드래그로 순서 변경"
                >
                  <GripVertical size={16} />
                </button>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 sm:w-40"
                  />
                </div>

                {/* Filter & Sort */}
                <div className="relative group">
                  <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <SlidersHorizontal size={16} className="text-gray-500" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 hidden group-hover:block">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500 mb-2">정렬</p>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value as typeof sortBy);
                          if (e.target.value !== 'custom') setEnableDragDrop(false);
                        }}
                        className="w-full text-sm bg-gray-100 dark:bg-gray-700 rounded px-2 py-1"
                      >
                        <option value="billingDay">결제일순</option>
                        <option value="name">이름순</option>
                        <option value="price">금액순</option>
                        <option value="custom">사용자 지정</option>
                      </select>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-500 mb-2">카테고리</p>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value as SubscriptionCategory | 'all')}
                        className="w-full text-sm bg-gray-100 dark:bg-gray-700 rounded px-2 py-1"
                      >
                        <option value="all">전체</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

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
          ) : enableDragDrop ? (
            <DraggableSubscriptionList
              subscriptions={filteredSubscriptions}
              onReorder={handleReorder}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ) : (
            <div className="space-y-3">
              {filteredSubscriptions.map((subscription) => (
                <SubscriptionCardDB
                  key={subscription.id}
                  subscription={subscription}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
              ))}
              {filteredSubscriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Exchange Rate */}
        {subscriptions.some((s) => s.currency === 'USD') && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">현재 환율</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  $1 = {formatNumber(exchangeRate)}원
                </span>
              </div>
              <button
                onClick={fetchExchangeRate}
                disabled={rateLoading}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <RefreshCw size={14} className={rateLoading ? 'animate-spin' : ''} />
                새로고침
              </button>
            </div>
          </div>
        )}

        {/* Category Summary */}
        {subscriptions.length > 0 && categoryData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                카테고리별 지출
              </h3>
            </div>

            <div className="space-y-4">
              {categoryData.map(({ category, amount, percentage }) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`} />
                      <span className="text-gray-700 dark:text-gray-300">
                        {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatNumber(amount)}원
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>MySubs - 구독 관리의 시작</p>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">이용약관</Link>
              <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">개인정보처리방침</Link>
              <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white">문의하기</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSubscription}
      />
    </div>
  );
}
