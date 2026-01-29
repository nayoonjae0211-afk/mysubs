'use client';

import { useState } from 'react';
import { X, Search, Clock, Users, AlertTriangle, Tag, StickyNote } from 'lucide-react';
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

  // 새 기능 state
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [sharedWith, setSharedWith] = useState('2');
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [memo, setMemo] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

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

    // 무료 체험 정보 자동 설정
    if (preset.hasFreeTrial && preset.trialDays) {
      setIsTrial(true);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + preset.trialDays);
      setTrialEndDate(endDate.toISOString().split('T')[0]);
    } else {
      setIsTrial(false);
      setTrialEndDate('');
    }

    setStep('custom');
  };

  const handleCustomClick = () => {
    setSelectedPreset(null);
    setName('');
    setPrice('');
    setCurrency('KRW');
    setCategory('other');
    setIsTrial(false);
    setTrialEndDate('');
    setIsShared(false);
    setSharedWith('2');
    setStep('custom');
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      price: parseFloat(price),
      currency,
      billingCycle,
      billingDay: parseInt(billingDay),
      category,
      startDate: new Date().toISOString(),
      isActive: true,
      isTrial: isTrial,
      trialEndDate: isTrial && trialEndDate ? trialEndDate : undefined,
      isShared: isShared,
      sharedWith: isShared ? parseInt(sharedWith) : undefined,
      myShare: isShared ? Math.round(parseFloat(price) / parseInt(sharedWith)) : undefined,
      autoRenewal: autoRenewal,
      memo: memo || undefined,
      tags: tags.length > 0 ? tags : undefined,
      logoUrl: selectedPreset?.logoUrl,
      cancelUrl: selectedPreset?.cancelUrl,
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
    setIsTrial(false);
    setTrialEndDate('');
    setIsShared(false);
    setSharedWith('2');
    setAutoRenewal(true);
    setMemo('');
    setTagInput('');
    setTags([]);
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
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: `${preset.color}20` }}
                      >
                        <img
                          src={preset.logoUrl}
                          alt={preset.name}
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `<span class="text-lg font-bold" style="color: ${preset.color}">${preset.name.charAt(0)}</span>`;
                          }}
                        />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white">{preset.name}</p>
                          {preset.hasFreeTrial && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full">
                              무료체험
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {CATEGORY_LABELS[preset.category]}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
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

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">추가 옵션</p>

                {/* Free Trial Toggle */}
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">무료 체험 중</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isTrial}
                      onChange={(e) => setIsTrial(e.target.checked)}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  {isTrial && (
                    <div className="pl-4">
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        체험 종료일
                      </label>
                      <input
                        type="date"
                        value={trialEndDate}
                        onChange={(e) => setTrialEndDate(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                  )}

                  {/* Shared Subscription Toggle */}
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Users size={20} className="text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">공유 구독</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isShared}
                      onChange={(e) => setIsShared(e.target.checked)}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  {isShared && (
                    <div className="pl-4 space-y-2">
                      <label className="block text-sm text-gray-600 dark:text-gray-400">
                        나누는 인원 수
                      </label>
                      <select
                        value={sharedWith}
                        onChange={(e) => setSharedWith(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 rounded-lg text-gray-900 dark:text-white"
                      >
                        {[2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num}명
                          </option>
                        ))}
                      </select>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        내 부담: {currency === 'USD' ? '$' : '₩'}
                        {Math.round(parseFloat(price || '0') / parseInt(sharedWith)).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Auto Renewal Warning Toggle */}
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={20} className="text-orange-500" />
                      <span className="text-gray-700 dark:text-gray-300">자동 갱신</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoRenewal}
                      onChange={(e) => setAutoRenewal(e.target.checked)}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  {/* Memo */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <StickyNote size={20} className="text-yellow-500" />
                      <span className="text-gray-700 dark:text-gray-300">메모</span>
                    </div>
                    <textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="메모를 입력하세요..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Tags */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Tag size={20} className="text-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">태그</span>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="태그 입력 후 Enter"
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                      >
                        추가
                      </button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-purple-900 dark:hover:text-purple-100"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
