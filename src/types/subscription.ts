export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: 'KRW' | 'USD';
  billingCycle: 'monthly' | 'yearly' | 'weekly';
  billingDay: number; // 1-31
  category: SubscriptionCategory;
  startDate: string;
  isActive: boolean;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionCategory =
  | 'streaming'    // 넷플릭스, 유튜브, 디즈니+
  | 'music'        // 멜론, 스포티파이, 애플뮤직
  | 'productivity' // 노션, 피그마, 어도비
  | 'gaming'       // 게임패스, PS+
  | 'shopping'     // 쿠팡 로켓와우, 네이버+
  | 'news'         // 뉴스 구독
  | 'fitness'      // 헬스, 운동 앱
  | 'cloud'        // iCloud, 구글 원
  | 'other';       // 기타

export interface SubscriptionPreset {
  name: string;
  category: SubscriptionCategory;
  defaultPrice: number;
  currency: 'KRW' | 'USD';
  icon?: string;
}

// 한국 인기 구독 서비스 프리셋
export const SUBSCRIPTION_PRESETS: SubscriptionPreset[] = [
  // Streaming
  { name: '넷플릭스', category: 'streaming', defaultPrice: 17000, currency: 'KRW' },
  { name: '유튜브 프리미엄', category: 'streaming', defaultPrice: 14900, currency: 'KRW' },
  { name: '디즈니+', category: 'streaming', defaultPrice: 9900, currency: 'KRW' },
  { name: '왓챠', category: 'streaming', defaultPrice: 12900, currency: 'KRW' },
  { name: '웨이브', category: 'streaming', defaultPrice: 10900, currency: 'KRW' },
  { name: '티빙', category: 'streaming', defaultPrice: 13900, currency: 'KRW' },
  { name: '쿠팡플레이', category: 'streaming', defaultPrice: 4990, currency: 'KRW' },

  // Music
  { name: '멜론', category: 'music', defaultPrice: 10900, currency: 'KRW' },
  { name: '스포티파이', category: 'music', defaultPrice: 10900, currency: 'KRW' },
  { name: '애플뮤직', category: 'music', defaultPrice: 10900, currency: 'KRW' },
  { name: '지니뮤직', category: 'music', defaultPrice: 10900, currency: 'KRW' },
  { name: '플로', category: 'music', defaultPrice: 10900, currency: 'KRW' },

  // Productivity
  { name: '노션', category: 'productivity', defaultPrice: 8, currency: 'USD' },
  { name: 'ChatGPT Plus', category: 'productivity', defaultPrice: 20, currency: 'USD' },
  { name: 'Figma', category: 'productivity', defaultPrice: 15, currency: 'USD' },
  { name: 'Adobe CC', category: 'productivity', defaultPrice: 59900, currency: 'KRW' },
  { name: 'Microsoft 365', category: 'productivity', defaultPrice: 8900, currency: 'KRW' },
  { name: 'Canva Pro', category: 'productivity', defaultPrice: 15000, currency: 'KRW' },

  // Shopping
  { name: '쿠팡 로켓와우', category: 'shopping', defaultPrice: 4990, currency: 'KRW' },
  { name: '네이버플러스 멤버십', category: 'shopping', defaultPrice: 4900, currency: 'KRW' },
  { name: '아마존 프라임', category: 'shopping', defaultPrice: 14.99, currency: 'USD' },

  // Gaming
  { name: 'Xbox Game Pass', category: 'gaming', defaultPrice: 14900, currency: 'KRW' },
  { name: 'PlayStation Plus', category: 'gaming', defaultPrice: 14900, currency: 'KRW' },
  { name: 'Nintendo Switch Online', category: 'gaming', defaultPrice: 4900, currency: 'KRW' },

  // Cloud
  { name: 'iCloud+', category: 'cloud', defaultPrice: 1100, currency: 'KRW' },
  { name: 'Google One', category: 'cloud', defaultPrice: 2400, currency: 'KRW' },
  { name: 'Dropbox', category: 'cloud', defaultPrice: 11.99, currency: 'USD' },

  // Fitness
  { name: '애플 피트니스+', category: 'fitness', defaultPrice: 11900, currency: 'KRW' },
];

export const CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  streaming: '스트리밍',
  music: '음악',
  productivity: '생산성',
  gaming: '게임',
  shopping: '쇼핑',
  news: '뉴스',
  fitness: '피트니스',
  cloud: '클라우드',
  other: '기타',
};

export const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  streaming: 'bg-red-500',
  music: 'bg-green-500',
  productivity: 'bg-blue-500',
  gaming: 'bg-purple-500',
  shopping: 'bg-orange-500',
  news: 'bg-gray-500',
  fitness: 'bg-pink-500',
  cloud: 'bg-cyan-500',
  other: 'bg-slate-500',
};
