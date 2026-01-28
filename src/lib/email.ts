import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

interface BillingReminder {
  userName: string;
  subscriptions: {
    name: string;
    price: number;
    currency: 'KRW' | 'USD';
    billingDay: number;
    daysUntil: number;
  }[];
}

interface MonthlyReport {
  userName: string;
  month: string;
  totalKRW: number;
  totalUSD: number;
  subscriptionCount: number;
  categoryBreakdown: { category: string; amount: number }[];
  upcomingTotal: number;
}

interface TrialEndingReminder {
  userName: string;
  subscriptionName: string;
  trialEndDate: string;
  daysLeft: number;
  price: number;
  currency: 'KRW' | 'USD';
}

// 결제일 알림 이메일
export async function sendBillingReminderEmail(to: string, data: BillingReminder) {
  const subscriptionList = data.subscriptions
    .map(sub => {
      const price = sub.currency === 'KRW'
        ? `${sub.price.toLocaleString()}원`
        : `$${sub.price}`;
      const daysText = sub.daysUntil === 0 ? '오늘' :
                       sub.daysUntil === 1 ? '내일' :
                       `${sub.daysUntil}일 후`;
      return `• ${sub.name}: ${price} (${daysText} 결제)`;
    })
    .join('\n');

  const totalKRW = data.subscriptions
    .filter(s => s.currency === 'KRW')
    .reduce((sum, s) => sum + s.price, 0);

  const totalUSD = data.subscriptions
    .filter(s => s.currency === 'USD')
    .reduce((sum, s) => sum + s.price, 0);

  let totalText = '';
  if (totalKRW > 0) totalText += `${totalKRW.toLocaleString()}원`;
  if (totalUSD > 0) totalText += `${totalKRW > 0 ? ' + ' : ''}$${totalUSD}`;

  const { error } = await getResend().emails.send({
    from: 'MySubs <noreply@mysubs.app>',
    to,
    subject: `[MySubs] ${data.subscriptions.length}개 구독 결제 예정 알림`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .subscription-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .subscription-item { padding: 12px 0; border-bottom: 1px solid #eee; }
          .subscription-item:last-child { border-bottom: none; }
          .total { font-size: 24px; font-weight: bold; color: #667eea; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">결제 예정 알림</h1>
            <p style="margin:10px 0 0 0; opacity:0.9;">곧 결제될 구독이 있어요</p>
          </div>
          <div class="content">
            <p>안녕하세요, ${data.userName}님!</p>
            <p>다음 구독들의 결제일이 다가왔어요:</p>

            <div class="subscription-list">
              ${data.subscriptions.map(sub => {
                const price = sub.currency === 'KRW'
                  ? `${sub.price.toLocaleString()}원`
                  : `$${sub.price}`;
                const daysText = sub.daysUntil === 0 ? '오늘 결제' :
                                 sub.daysUntil === 1 ? '내일 결제' :
                                 `${sub.daysUntil}일 후 결제`;
                return `
                  <div class="subscription-item">
                    <strong>${sub.name}</strong>
                    <div style="color:#666; font-size:14px;">${price} · ${daysText}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="total">총 ${totalText}</div>

            <a href="https://mysubs-ruddy.vercel.app/dashboard" class="button">대시보드에서 확인하기</a>

            <div class="footer">
              <p>이 메일은 MySubs에서 발송되었습니다.</p>
              <p>더 이상 알림을 받고 싶지 않으시면 대시보드에서 설정을 변경해주세요.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error('Failed to send billing reminder email:', error);
    throw error;
  }

  return { success: true };
}

// 무료 체험 종료 알림 이메일
export async function sendTrialEndingEmail(to: string, data: TrialEndingReminder) {
  const price = data.currency === 'KRW'
    ? `${data.price.toLocaleString()}원`
    : `$${data.price}`;

  const { error } = await getResend().emails.send({
    from: 'MySubs <noreply@mysubs.app>',
    to,
    subject: `[MySubs] ${data.subscriptionName} 무료 체험이 ${data.daysLeft}일 후 종료됩니다`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">무료 체험 종료 예정</h1>
            <p style="margin:10px 0 0 0; opacity:0.9;">결제 전에 확인하세요!</p>
          </div>
          <div class="content">
            <p>안녕하세요, ${data.userName}님!</p>

            <div class="warning-box">
              <h3 style="margin:0 0 10px 0; color:#92400e;">${data.subscriptionName}</h3>
              <p style="margin:0; font-size:18px;">
                무료 체험이 <strong>${data.daysLeft}일 후</strong> (${data.trialEndDate}) 종료됩니다.
              </p>
              <p style="margin:10px 0 0 0; color:#92400e;">
                종료 후 <strong>${price}/월</strong>이 자동 결제됩니다.
              </p>
            </div>

            <p>계속 사용하실 계획이 아니라면, 무료 체험 기간 내에 구독을 취소해주세요.</p>

            <a href="https://mysubs-ruddy.vercel.app/dashboard" class="button">대시보드에서 확인하기</a>

            <div class="footer">
              <p>이 메일은 MySubs에서 발송되었습니다.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error('Failed to send trial ending email:', error);
    throw error;
  }

  return { success: true };
}

// 월간 리포트 이메일
export async function sendMonthlyReportEmail(to: string, data: MonthlyReport) {
  const totalText = data.totalUSD > 0
    ? `${data.totalKRW.toLocaleString()}원 + $${data.totalUSD}`
    : `${data.totalKRW.toLocaleString()}원`;

  const { error } = await getResend().emails.send({
    from: 'MySubs <noreply@mysubs.app>',
    to,
    subject: `[MySubs] ${data.month} 구독 리포트`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .stat-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center; }
          .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
          .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
          .category-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .category-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .category-item:last-child { border-bottom: none; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">${data.month} 구독 리포트</h1>
            <p style="margin:10px 0 0 0; opacity:0.9;">이번 달 구독 현황을 확인하세요</p>
          </div>
          <div class="content">
            <p>안녕하세요, ${data.userName}님!</p>
            <p>이번 달 구독 현황을 정리해드려요.</p>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div class="stat-box">
                <div class="stat-number">${totalText}</div>
                <div class="stat-label">이번 달 총 지출</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${data.subscriptionCount}개</div>
                <div class="stat-label">활성 구독</div>
              </div>
            </div>

            <h3>카테고리별 지출</h3>
            <div class="category-list">
              ${data.categoryBreakdown.map(cat => `
                <div class="category-item">
                  <span>${cat.category}</span>
                  <strong>${cat.amount.toLocaleString()}원</strong>
                </div>
              `).join('')}
            </div>

            <div class="stat-box">
              <div class="stat-number">${data.upcomingTotal.toLocaleString()}원</div>
              <div class="stat-label">다음 달 예상 지출</div>
            </div>

            <a href="https://mysubs-ruddy.vercel.app/dashboard" class="button">대시보드에서 자세히 보기</a>

            <div class="footer">
              <p>이 메일은 MySubs에서 매월 1일에 발송됩니다.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error('Failed to send monthly report email:', error);
    throw error;
  }

  return { success: true };
}
