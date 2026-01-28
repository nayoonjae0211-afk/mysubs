'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useSubscriptionStore } from '@/store/subscription';
import {
  SUBSCRIPTION_PRESETS,
  CATEGORY_LABELS,
  SubscriptionCategory,
  SubscriptionPreset,
  Subscription,
} from '@/types/subscription';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

type Step = 'select' | 'custom';

export default function AddSubscriptionModal({ isOpen, onClose, onAdd }: Props) {
  const [step, setStep] = useState<Step>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<SubscriptionPreset | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'KRW' | 'USD'>('KRW');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [billingDay, setBillingDay] = useState('1');
  const [category, setCategory] = useState<SubscriptionCategory>('other');

  const { addSubscription } = useSubscriptionStore();

  const filteredPresets = SUBSCRIPTION_PRESETS.filter((preset) =>
    preset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePresetSelect = (preset: SubscriptionPreset) => {
    setSelectedPreset(preset);
    setName(preset.name);
    setPrice(preset.defaultPrice.toString());
    setCurrency(preset.currency);
    setCategory(preset.category);
    setStep('custom');
  };

  const handleCustomClick = () => {
    setSelectedPreset(null);
    setName('');
    setPrice('');
    setCurrency('KRW');
    setCategory('other');
    setStep('custom');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subscriptionData = {
      name,
      price: parseFloat(price),
      currency,
      billingCycle,
      billingDay: parseInt(billingDay),
      category,
      startDate: new Date().toISOString(),
      isActive: true,
    };

    if (onAdd) {
      onAdd(subscriptionData);
    } else {
      addSubscription(subscriptionData);
    }

    handleClose();
  };

  const handleClose = () => {
    setStep('select');
    setSearchQuery('');
    setSelectedPreset(null);
    setName('');
    setPrice('');
    setCurrency('KRW');
    setBillingCycle('monthly');
    setBillingDay('1');
    setCategory('other');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {step === 'select' ? '구독 추가' : selectedPreset ? selectedPreset.name : '직접 입력'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {step === 'select' ? (
            <div className="p-4">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="서비스 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Custom Input Button */}
              <button
                onClick={handleCustomClick}
                className="w-full p-4 mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                + 직접 입력하기
              </button>

              {/* Preset List */}
              <div className="space-y-2">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-400">
                        {preset.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{preset.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {CATEGORY_LABELS[preset.category]}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {preset.currency === 'USD' ? '$' : '₩'}
                      {preset.defaultPrice.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  서비스명
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 넷플릭스"
                  required
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Price & Currency */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    금액
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    통화
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'KRW' | 'USD')}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="KRW">KRW</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  결제 주기
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['monthly', 'yearly', 'weekly'] as const).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setBillingCycle(cycle)}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        billingCycle === cycle
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {cycle === 'monthly' ? '월간' : cycle === 'yearly' ? '연간' : '주간'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Billing Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  결제일
                </label>
                <select
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      매월 {day}일
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  카테고리
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SubscriptionCategory)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  뒤로
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  추가하기
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
