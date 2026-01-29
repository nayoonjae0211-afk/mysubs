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
  tags?: string[]; // 사용자 정의 태그
  displayOrder?: number; // 사용자 정의 정렬 순서
  // 무료 체험 관련
  isTrial?: boolean;
  trialEndDate?: string;
  // 공유 구독 관련
  isShared?: boolean;
  sharedWith?: number; // 나눠 쓰는 인원 수
  myShare?: number; // 내 부담 금액
  // 자동 갱신 경고
  autoRenewal?: boolean;
  // 연간 결제 전환 시 절약 예상액
  annualPrice?: number; // 연간 결제 가격 (있는 경우)
  // 메타데이터
  logoUrl?: string;
  cancelUrl?: string; // 해지 페이지 URL
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
  logoUrl: string; // 실제 로고 URL
  color: string; // 브랜드 컬러
  cancelUrl?: string; // 해지 페이지 URL
  hasFreeTrial?: boolean; // 무료 체험 제공 여부
  trialDays?: number; // 무료 체험 기간
}

// Google Favicon API 사용 (더 안정적)
const getFaviconUrl = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

// 한국 인기 구독 서비스 프리셋 (실제 로고 사용)
export const SUBSCRIPTION_PRESETS: SubscriptionPreset[] = [
  // Streaming
  { name: '넷플릭스', category: 'streaming', defaultPrice: 17000, currency: 'KRW', logoUrl: getFaviconUrl('netflix.com'), color: '#E50914', cancelUrl: 'https://www.netflix.com/cancelplan' },
  { name: '유튜브 프리미엄', category: 'streaming', defaultPrice: 14900, currency: 'KRW', logoUrl: getFaviconUrl('youtube.com'), color: '#FF0000', cancelUrl: 'https://www.youtube.com/paid_memberships', hasFreeTrial: true, trialDays: 30 },
  { name: '디즈니+', category: 'streaming', defaultPrice: 9900, currency: 'KRW', logoUrl: getFaviconUrl('disneyplus.com'), color: '#113CCF', cancelUrl: 'https://www.disneyplus.com/account/subscription' },
  { name: '왓챠', category: 'streaming', defaultPrice: 12900, currency: 'KRW', logoUrl: getFaviconUrl('watcha.com'), color: '#FF0558', cancelUrl: 'https://watcha.com/settings/payment' },
  { name: '웨이브', category: 'streaming', defaultPrice: 10900, currency: 'KRW', logoUrl: getFaviconUrl('wavve.com'), color: '#1E3264', cancelUrl: 'https://www.wavve.com/my/subscription' },
  { name: '티빙', category: 'streaming', defaultPrice: 13500, currency: 'KRW', logoUrl: getFaviconUrl('tving.com'), color: '#FF0A54', cancelUrl: 'https://www.tving.com/my/membership' },
  { name: '쿠팡플레이', category: 'streaming', defaultPrice: 7890, currency: 'KRW', logoUrl: getFaviconUrl('coupangplay.com'), color: '#E31837', cancelUrl: 'https://www.coupang.com/np/coupangplay' },
  { name: 'Apple TV+', category: 'streaming', defaultPrice: 9900, currency: 'KRW', logoUrl: getFaviconUrl('tv.apple.com'), color: '#000000', cancelUrl: 'https://support.apple.com/ko-kr/HT202039', hasFreeTrial: true, trialDays: 7 },
  { name: 'Amazon Prime Video', category: 'streaming', defaultPrice: 5900, currency: 'KRW', logoUrl: getFaviconUrl('primevideo.com'), color: '#00A8E1', cancelUrl: 'https://www.amazon.com/mc' },

  // Music
  { name: '멜론', category: 'music', defaultPrice: 10900, currency: 'KRW', logoUrl: getFaviconUrl('melon.com'), color: '#00CD3C', cancelUrl: 'https://www.melon.com/mypay/main.htm' },
  { name: '스포티파이', category: 'music', defaultPrice: 11990, currency: 'KRW', logoUrl: getFaviconUrl('spotify.com'), color: '#1DB954', cancelUrl: 'https://www.spotify.com/account/subscription/', hasFreeTrial: true, trialDays: 30 },
  { name: '애플뮤직', category: 'music', defaultPrice: 11000, currency: 'KRW', logoUrl: getFaviconUrl('music.apple.com'), color: '#FA243C', cancelUrl: 'https://support.apple.com/ko-kr/HT202039', hasFreeTrial: true, trialDays: 30 },
  { name: '지니뮤직', category: 'music', defaultPrice: 10900, currency: 'KRW', logoUrl: getFaviconUrl('genie.co.kr'), color: '#5A4FCF', cancelUrl: 'https://www.genie.co.kr/myInfo/payInfo' },
  { name: '플로', category: 'music', defaultPrice: 10900, currency: 'KRW', logoUrl: getFaviconUrl('music-flo.com'), color: '#7C3AED', cancelUrl: 'https://www.music-flo.com/my/ticket' },
  { name: '유튜브 뮤직', category: 'music', defaultPrice: 10900, currency: 'KRW', logoUrl: getFaviconUrl('music.youtube.com'), color: '#FF0000', cancelUrl: 'https://www.youtube.com/paid_memberships' },
  { name: '벅스', category: 'music', defaultPrice: 7900, currency: 'KRW', logoUrl: getFaviconUrl('bugs.co.kr'), color: '#E4004B', cancelUrl: 'https://www.bugs.co.kr' },

  // Productivity
  { name: '노션', category: 'productivity', defaultPrice: 8, currency: 'USD', logoUrl: getFaviconUrl('notion.so'), color: '#000000', cancelUrl: 'https://www.notion.so/my-account', hasFreeTrial: true, trialDays: 7 },
  { name: 'ChatGPT Plus', category: 'productivity', defaultPrice: 20, currency: 'USD', logoUrl: getFaviconUrl('chat.openai.com'), color: '#10A37F', cancelUrl: 'https://chat.openai.com/settings/subscription' },
  { name: 'Claude Pro', category: 'productivity', defaultPrice: 20, currency: 'USD', logoUrl: getFaviconUrl('claude.ai'), color: '#D97757', cancelUrl: 'https://claude.ai/settings' },
  { name: 'Figma', category: 'productivity', defaultPrice: 15, currency: 'USD', logoUrl: getFaviconUrl('figma.com'), color: '#F24E1E', cancelUrl: 'https://www.figma.com/settings', hasFreeTrial: true, trialDays: 14 },
  { name: 'Adobe CC', category: 'productivity', defaultPrice: 59900, currency: 'KRW', logoUrl: getFaviconUrl('adobe.com'), color: '#FF0000', cancelUrl: 'https://account.adobe.com/plans', hasFreeTrial: true, trialDays: 7 },
  { name: 'Microsoft 365', category: 'productivity', defaultPrice: 8900, currency: 'KRW', logoUrl: getFaviconUrl('microsoft365.com'), color: '#0078D4', cancelUrl: 'https://account.microsoft.com/services', hasFreeTrial: true, trialDays: 30 },
  { name: 'Canva Pro', category: 'productivity', defaultPrice: 15000, currency: 'KRW', logoUrl: getFaviconUrl('canva.com'), color: '#00C4CC', cancelUrl: 'https://www.canva.com/settings/billing', hasFreeTrial: true, trialDays: 30 },
  { name: 'GitHub Copilot', category: 'productivity', defaultPrice: 10, currency: 'USD', logoUrl: getFaviconUrl('github.com'), color: '#238636', cancelUrl: 'https://github.com/settings/copilot', hasFreeTrial: true, trialDays: 30 },
  { name: 'Grammarly', category: 'productivity', defaultPrice: 12, currency: 'USD', logoUrl: getFaviconUrl('grammarly.com'), color: '#15C39A', cancelUrl: 'https://www.grammarly.com/account/subscription', hasFreeTrial: true, trialDays: 7 },
  { name: 'Slack', category: 'productivity', defaultPrice: 8.75, currency: 'USD', logoUrl: getFaviconUrl('slack.com'), color: '#4A154B', cancelUrl: 'https://slack.com/account/settings' },
  { name: 'Linear', category: 'productivity', defaultPrice: 8, currency: 'USD', logoUrl: getFaviconUrl('linear.app'), color: '#5E6AD2', cancelUrl: 'https://linear.app/settings' },
  { name: 'Cursor', category: 'productivity', defaultPrice: 20, currency: 'USD', logoUrl: getFaviconUrl('cursor.sh'), color: '#000000', cancelUrl: 'https://cursor.sh' },

  // Shopping
  { name: '쿠팡 로켓와우', category: 'shopping', defaultPrice: 7890, currency: 'KRW', logoUrl: getFaviconUrl('coupang.com'), color: '#E31837', cancelUrl: 'https://www.coupang.com/np/rocketwow', hasFreeTrial: true, trialDays: 30 },
  { name: '네이버플러스 멤버십', category: 'shopping', defaultPrice: 4900, currency: 'KRW', logoUrl: getFaviconUrl('naver.com'), color: '#03C75A', cancelUrl: 'https://nid.naver.com/membership/my', hasFreeTrial: true, trialDays: 30 },
  { name: '아마존 프라임', category: 'shopping', defaultPrice: 14.99, currency: 'USD', logoUrl: getFaviconUrl('amazon.com'), color: '#FF9900', cancelUrl: 'https://www.amazon.com/mc', hasFreeTrial: true, trialDays: 30 },
  { name: '마켓컬리 컬리패스', category: 'shopping', defaultPrice: 4900, currency: 'KRW', logoUrl: getFaviconUrl('kurly.com'), color: '#5F0080', cancelUrl: 'https://www.kurly.com/mypage/membership' },
  { name: 'SSG 멤버십', category: 'shopping', defaultPrice: 3000, currency: 'KRW', logoUrl: getFaviconUrl('ssg.com'), color: '#FF5A5F', cancelUrl: 'https://www.ssg.com' },

  // Gaming
  { name: 'Xbox Game Pass', category: 'gaming', defaultPrice: 18500, currency: 'KRW', logoUrl: getFaviconUrl('xbox.com'), color: '#107C10', cancelUrl: 'https://account.microsoft.com/services/gamepass', hasFreeTrial: true, trialDays: 14 },
  { name: 'PlayStation Plus', category: 'gaming', defaultPrice: 10800, currency: 'KRW', logoUrl: getFaviconUrl('playstation.com'), color: '#003791', cancelUrl: 'https://www.playstation.com/ko-kr/playstation-plus/' },
  { name: 'Nintendo Switch Online', category: 'gaming', defaultPrice: 4900, currency: 'KRW', logoUrl: getFaviconUrl('nintendo.com'), color: '#E60012', cancelUrl: 'https://accounts.nintendo.com/shop/subscriptions', hasFreeTrial: true, trialDays: 7 },
  { name: 'EA Play', category: 'gaming', defaultPrice: 5900, currency: 'KRW', logoUrl: getFaviconUrl('ea.com'), color: '#FF4747', cancelUrl: 'https://www.ea.com/ea-play' },
  { name: 'Ubisoft+', category: 'gaming', defaultPrice: 14.99, currency: 'USD', logoUrl: getFaviconUrl('ubisoft.com'), color: '#0070FF', cancelUrl: 'https://plus.ubisoft.com' },

  // Kakao
  { name: '카카오톡 이모티콘 플러스', category: 'other', defaultPrice: 3900, currency: 'KRW', logoUrl: getFaviconUrl('emoticon.kakao.com'), color: '#FEE500', cancelUrl: 'https://my.kakao.com/product/EMOTICON001' },
  { name: '톡서랍 플러스', category: 'cloud', defaultPrice: 2500, currency: 'KRW', logoUrl: getFaviconUrl('drive.kakao.com'), color: '#FEE500', cancelUrl: 'https://drive.kakao.com' },
  { name: '카카오 T 멤버스', category: 'other', defaultPrice: 4900, currency: 'KRW', logoUrl: getFaviconUrl('kakaomobility.com'), color: '#FEE500', cancelUrl: 'https://www.kakaomobility.com' },

  // Cloud
  { name: 'iCloud+', category: 'cloud', defaultPrice: 1100, currency: 'KRW', logoUrl: getFaviconUrl('icloud.com'), color: '#3693F3', cancelUrl: 'https://support.apple.com/ko-kr/HT207594' },
  { name: 'Google One', category: 'cloud', defaultPrice: 2500, currency: 'KRW', logoUrl: getFaviconUrl('one.google.com'), color: '#4285F4', cancelUrl: 'https://one.google.com/settings' },
  { name: 'Dropbox', category: 'cloud', defaultPrice: 11.99, currency: 'USD', logoUrl: getFaviconUrl('dropbox.com'), color: '#0061FF', cancelUrl: 'https://www.dropbox.com/account/plans', hasFreeTrial: true, trialDays: 30 },
  { name: 'OneDrive', category: 'cloud', defaultPrice: 1900, currency: 'KRW', logoUrl: getFaviconUrl('onedrive.com'), color: '#0078D4', cancelUrl: 'https://account.microsoft.com/services' },

  // Fitness
  { name: '애플 피트니스+', category: 'fitness', defaultPrice: 11900, currency: 'KRW', logoUrl: getFaviconUrl('apple.com/apple-fitness-plus'), color: '#FA2C5A', cancelUrl: 'https://support.apple.com/ko-kr/HT212680', hasFreeTrial: true, trialDays: 30 },
  { name: 'Strava', category: 'fitness', defaultPrice: 5.99, currency: 'USD', logoUrl: getFaviconUrl('strava.com'), color: '#FC4C02', cancelUrl: 'https://www.strava.com/settings/subscription' },
  { name: 'Peloton', category: 'fitness', defaultPrice: 12.99, currency: 'USD', logoUrl: getFaviconUrl('onepeloton.com'), color: '#000000', cancelUrl: 'https://www.onepeloton.com' },

  // News
  { name: '뉴욕타임스', category: 'news', defaultPrice: 4, currency: 'USD', logoUrl: getFaviconUrl('nytimes.com'), color: '#000000', cancelUrl: 'https://myaccount.nytimes.com/seg/subscription' },
  { name: '조선일보 프리미엄', category: 'news', defaultPrice: 9900, currency: 'KRW', logoUrl: getFaviconUrl('chosun.com'), color: '#004E98', cancelUrl: 'https://www.chosun.com/premium/' },
  { name: '중앙일보', category: 'news', defaultPrice: 9900, currency: 'KRW', logoUrl: getFaviconUrl('joongang.co.kr'), color: '#0066CC', cancelUrl: 'https://joongang.co.kr' },
  { name: 'The Economist', category: 'news', defaultPrice: 22, currency: 'USD', logoUrl: getFaviconUrl('economist.com'), color: '#E3120B', cancelUrl: 'https://www.economist.com/account' },
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
