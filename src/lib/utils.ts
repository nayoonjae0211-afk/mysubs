import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: 'KRW' | 'USD' = 'KRW'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(amount));
}

export function getDaysUntilBilling(billingDay: number): number {
  const today = new Date();
  const currentDay = today.getDate();

  if (billingDay >= currentDay) {
    return billingDay - currentDay;
  }

  // 다음 달로 넘어감
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return (daysInMonth - currentDay) + billingDay;
}

export function getBillingDateText(billingDay: number): string {
  const daysUntil = getDaysUntilBilling(billingDay);

  if (daysUntil === 0) return '오늘';
  if (daysUntil === 1) return '내일';
  if (daysUntil <= 7) return `${daysUntil}일 후`;

  return `매월 ${billingDay}일`;
}
