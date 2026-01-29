'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Subscription } from '@/types/subscription';
import { formatNumber } from '@/lib/utils';

interface SpendingChartProps {
  subscriptions: Subscription[];
  exchangeRate: number;
}

export default function SpendingChart({ subscriptions, exchangeRate }: SpendingChartProps) {
  // 지난 12개월 데이터 생성
  const generateMonthlyData = () => {
    const data = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = `${date.getMonth() + 1}월`;

      // 해당 월에 활성화된 구독의 지출 계산
      let monthlySpending = 0;

      subscriptions.forEach((sub) => {
        const startDate = new Date(sub.startDate);
        // 구독 시작일이 해당 월 이전이고 활성 상태인 경우
        if (startDate <= date && sub.isActive) {
          let price = sub.price;
          if (sub.currency === 'USD') price *= exchangeRate;
          if (sub.billingCycle === 'yearly') {
            // 연간 결제는 해당 월에만 청구
            const billingMonth = startDate.getMonth();
            if (date.getMonth() === billingMonth) {
              monthlySpending += price;
            }
          } else if (sub.billingCycle === 'weekly') {
            monthlySpending += price * 4;
          } else {
            monthlySpending += price;
          }
        }
      });

      data.push({
        month: monthLabel,
        monthKey,
        spending: Math.round(monthlySpending),
      });
    }

    return data;
  };

  const data = generateMonthlyData();
  const maxSpending = Math.max(...data.map((d) => d.spending));
  const avgSpending = data.reduce((sum, d) => sum + d.spending, 0) / data.length;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-blue-600">
            {formatNumber(payload[0].value)}원
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            월별 지출 추이
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            최근 12개월 구독 지출
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">월 평균</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatNumber(Math.round(avgSpending))}원
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
              domain={[0, maxSpending * 1.2]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="spending"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSpending)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">최고 지출</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatNumber(maxSpending)}원
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">월 평균</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatNumber(Math.round(avgSpending))}원
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">연간 추정</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatNumber(Math.round(avgSpending * 12))}원
          </p>
        </div>
      </div>
    </div>
  );
}
