import { Subscription, CATEGORY_LABELS } from '@/types/subscription';

// CSV 내보내기
export function exportToCSV(subscriptions: Subscription[], exchangeRate: number): void {
  const headers = [
    '이름',
    '가격',
    '통화',
    '월간 환산 (원)',
    '결제 주기',
    '결제일',
    '카테고리',
    '상태',
    '시작일',
    '메모',
    '태그',
  ];

  const rows = subscriptions.map((sub) => {
    let monthlyKRW = sub.price;
    if (sub.currency === 'USD') monthlyKRW *= exchangeRate;
    if (sub.billingCycle === 'yearly') monthlyKRW /= 12;
    else if (sub.billingCycle === 'weekly') monthlyKRW *= 4;

    return [
      sub.name,
      sub.price.toString(),
      sub.currency,
      Math.round(monthlyKRW).toString(),
      sub.billingCycle === 'monthly' ? '월간' : sub.billingCycle === 'yearly' ? '연간' : '주간',
      sub.billingDay.toString(),
      CATEGORY_LABELS[sub.category],
      sub.isActive ? '활성' : '비활성',
      sub.startDate,
      sub.memo || '',
      sub.tags?.join(', ') || '',
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mysubs_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 엑셀 내보내기 (간단한 HTML 테이블 기반)
export function exportToExcel(subscriptions: Subscription[], exchangeRate: number): void {
  const headers = [
    '이름',
    '가격',
    '통화',
    '월간 환산 (원)',
    '결제 주기',
    '결제일',
    '카테고리',
    '상태',
    '시작일',
    '메모',
    '태그',
  ];

  const rows = subscriptions.map((sub) => {
    let monthlyKRW = sub.price;
    if (sub.currency === 'USD') monthlyKRW *= exchangeRate;
    if (sub.billingCycle === 'yearly') monthlyKRW /= 12;
    else if (sub.billingCycle === 'weekly') monthlyKRW *= 4;

    return [
      sub.name,
      sub.price,
      sub.currency,
      Math.round(monthlyKRW),
      sub.billingCycle === 'monthly' ? '월간' : sub.billingCycle === 'yearly' ? '연간' : '주간',
      sub.billingDay,
      CATEGORY_LABELS[sub.category],
      sub.isActive ? '활성' : '비활성',
      sub.startDate,
      sub.memo || '',
      sub.tags?.join(', ') || '',
    ];
  });

  // 총계 계산
  const totalMonthly = subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, sub) => {
      let price = sub.price;
      if (sub.currency === 'USD') price *= exchangeRate;
      if (sub.billingCycle === 'yearly') price /= 12;
      else if (sub.billingCycle === 'weekly') price *= 4;
      return sum + price;
    }, 0);

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>구독 목록</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .number { text-align: right; }
        .total { background-color: #e8f5e9; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell, i) => `<td${i === 1 || i === 3 ? ' class="number"' : ''}>${cell}</td>`).join('')}</tr>`).join('')}
          <tr class="total">
            <td colspan="3">월간 총 지출</td>
            <td class="number">${Math.round(totalMonthly).toLocaleString()}원</td>
            <td colspan="7"></td>
          </tr>
          <tr class="total">
            <td colspan="3">연간 총 지출</td>
            <td class="number">${Math.round(totalMonthly * 12).toLocaleString()}원</td>
            <td colspan="7"></td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 20px; color: #666;">MySubs에서 내보냄 - ${new Date().toLocaleDateString('ko-KR')}</p>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mysubs_export_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// JSON 내보내기
export function exportToJSON(subscriptions: Subscription[]): void {
  const data = {
    exportDate: new Date().toISOString(),
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter((s) => s.isActive).length,
    subscriptions: subscriptions,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mysubs_export_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
