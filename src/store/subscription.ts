import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subscription } from '@/types/subscription';

interface SubscriptionState {
  subscriptions: Subscription[];
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  toggleActive: (id: string) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: [],

      addSubscription: (subscription) => {
        const now = new Date().toISOString();
        const newSubscription: Subscription = {
          ...subscription,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          subscriptions: [...state.subscriptions, newSubscription],
        }));
      },

      updateSubscription: (id, updates) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id
              ? { ...sub, ...updates, updatedAt: new Date().toISOString() }
              : sub
          ),
        }));
      },

      deleteSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        }));
      },

      toggleActive: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id
              ? { ...sub, isActive: !sub.isActive, updatedAt: new Date().toISOString() }
              : sub
          ),
        }));
      },
    }),
    {
      name: 'mysubs-storage',
    }
  )
);

// 유틸리티 함수들
export function calculateMonthlyTotal(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((sub) => sub.isActive)
    .reduce((total, sub) => {
      let monthlyPrice = sub.price;

      // USD를 KRW로 변환 (대략적인 환율)
      if (sub.currency === 'USD') {
        monthlyPrice *= 1350;
      }

      // 연간 구독은 월 단위로 변환
      if (sub.billingCycle === 'yearly') {
        monthlyPrice /= 12;
      } else if (sub.billingCycle === 'weekly') {
        monthlyPrice *= 4;
      }

      return total + monthlyPrice;
    }, 0);
}

export function calculateYearlyTotal(subscriptions: Subscription[]): number {
  return calculateMonthlyTotal(subscriptions) * 12;
}

export function getUpcomingBillings(subscriptions: Subscription[], days: number = 7): Subscription[] {
  const today = new Date();
  const currentDay = today.getDate();

  return subscriptions
    .filter((sub) => sub.isActive)
    .filter((sub) => {
      const billingDay = sub.billingDay;
      const daysUntilBilling = billingDay >= currentDay
        ? billingDay - currentDay
        : (30 - currentDay) + billingDay;
      return daysUntilBilling <= days;
    })
    .sort((a, b) => a.billingDay - b.billingDay);
}

export function groupByCategory(subscriptions: Subscription[]): Record<string, Subscription[]> {
  return subscriptions.reduce((acc, sub) => {
    if (!acc[sub.category]) {
      acc[sub.category] = [];
    }
    acc[sub.category].push(sub);
    return acc;
  }, {} as Record<string, Subscription[]>);
}
