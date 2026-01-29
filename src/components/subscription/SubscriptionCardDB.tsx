'use client';

import { useState } from 'react';
import { MoreVertical, Trash2, Power, ExternalLink, Clock, Users, AlertTriangle } from 'lucide-react';
import { Subscription, CATEGORY_LABELS, CATEGORY_COLORS, SUBSCRIPTION_PRESETS } from '@/types/subscription';
import { formatNumber, getBillingDateText } from '@/lib/utils';

interface Props {
  subscription: Subscription;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SubscriptionCardDB({ subscription, onToggleActive, onDelete }: Props) {
  const [showMenu, setShowMenu] = useState(false);

  // 프리셋에서 아이콘과 해지 URL 찾기
  const preset = SUBSCRIPTION_PRESETS.find(
    (p) => p.name.toLowerCase() === subscription.name.toLowerCase()
  );

  const displayPrice = subscription.currency === 'USD'
    ? `$${subscription.price}`
    : `${formatNumber(subscription.price)}원`;

  const cycleLabel = subscription.billingCycle === 'monthly'
    ? '/월'
    : subscription.billingCycle === 'yearly'
    ? '/년'
    : '/주';

  // 무료 체험 남은 일수 계산
  const getTrialDaysLeft = () => {
    if (!subscription.isTrial || !subscription.trialEndDate) return null;
    const endDate = new Date(subscription.trialEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const trialDaysLeft = getTrialDaysLeft();

  // 공유 구독 내 부담 금액
  const myShareAmount = subscription.isShared && subscription.sharedWith
    ? Math.round(subscription.price / subscription.sharedWith)
    : subscription.price;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-opacity ${
        !subscription.isActive ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Icon/Avatar */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${
            preset ? '' : `text-white font-bold ${CATEGORY_COLORS[subscription.category]}`
          }`}
          style={preset ? { backgroundColor: `${preset.color}20` } : undefined}
        >
          {preset?.logoUrl ? (
            <img
              src={preset.logoUrl}
              alt={subscription.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-lg font-bold" style="color: ${preset.color}">${subscription.name.charAt(0)}</span>`;
                }
              }}
            />
          ) : (
            <span className="text-lg font-bold">{subscription.name.charAt(0)}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {subscription.name}
            </h3>
            {!subscription.isActive && (
              <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                일시정지
              </span>
            )}
            {subscription.isTrial && trialDaysLeft !== null && trialDaysLeft > 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
                <Clock size={10} />
                체험 {trialDaysLeft}일 남음
              </span>
            )}
            {subscription.isTrial && trialDaysLeft === 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
                <AlertTriangle size={10} />
                오늘 종료
              </span>
            )}
            {subscription.isShared && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                <Users size={10} />
                {subscription.sharedWith}명 공유
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{CATEGORY_LABELS[subscription.category]}</span>
            <span>·</span>
            <span>{getBillingDateText(subscription.billingDay)}</span>
            {subscription.autoRenewal === false && (
              <>
                <span>·</span>
                <span className="text-orange-500">자동갱신 꺼짐</span>
              </>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          {subscription.isShared ? (
            <>
              <p className="font-semibold text-gray-900 dark:text-white">
                {subscription.currency === 'USD'
                  ? `$${myShareAmount}`
                  : `${formatNumber(myShareAmount)}원`}
              </p>
              <p className="text-xs text-gray-400 line-through">
                {displayPrice}
              </p>
            </>
          ) : (
            <p className="font-semibold text-gray-900 dark:text-white">
              {displayPrice}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">{cycleLabel}</p>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreVertical size={20} className="text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20 overflow-hidden">
                <button
                  onClick={() => {
                    onToggleActive(subscription.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Power size={16} />
                  <span>{subscription.isActive ? '일시정지' : '다시 시작'}</span>
                </button>
                {(preset?.cancelUrl || subscription.cancelUrl) && (
                  <a
                    href={preset?.cancelUrl || subscription.cancelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span>해지 페이지</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    if (confirm(`"${subscription.name}" 구독을 삭제하시겠습니까?`)) {
                      onDelete(subscription.id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>삭제</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
