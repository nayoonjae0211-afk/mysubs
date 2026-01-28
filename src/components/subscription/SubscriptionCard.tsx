'use client';

import { useState } from 'react';
import { MoreVertical, Trash2, Power, Edit2 } from 'lucide-react';
import { Subscription, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/subscription';
import { useSubscriptionStore } from '@/store/subscription';
import { formatNumber, getBillingDateText } from '@/lib/utils';

interface Props {
  subscription: Subscription;
}

export default function SubscriptionCard({ subscription }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const { deleteSubscription, toggleActive } = useSubscriptionStore();

  const displayPrice = subscription.currency === 'USD'
    ? `$${subscription.price}`
    : `${formatNumber(subscription.price)}원`;

  const cycleLabel = subscription.billingCycle === 'monthly'
    ? '/월'
    : subscription.billingCycle === 'yearly'
    ? '/년'
    : '/주';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-opacity ${
        !subscription.isActive ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Icon/Avatar */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
            CATEGORY_COLORS[subscription.category]
          }`}
        >
          {subscription.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {subscription.name}
            </h3>
            {!subscription.isActive && (
              <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                일시정지
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{CATEGORY_LABELS[subscription.category]}</span>
            <span>·</span>
            <span>{getBillingDateText(subscription.billingDay)}</span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="font-semibold text-gray-900 dark:text-white">
            {displayPrice}
          </p>
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
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20 overflow-hidden">
                <button
                  onClick={() => {
                    toggleActive(subscription.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Power size={16} />
                  <span>{subscription.isActive ? '일시정지' : '다시 시작'}</span>
                </button>
                <button
                  onClick={() => {
                    deleteSubscription(subscription.id);
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
