import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
            홈으로
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          개인정보처리방침
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <p>
            MySubs (이하 &quot;서비스&quot;)는 회원의 개인정보를 중요시하며,
            「개인정보 보호법」을 준수하고 있습니다.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              1. 수집하는 개인정보 항목
            </h2>
            <p>서비스는 회원가입, 서비스 이용을 위해 아래와 같은 개인정보를 수집합니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>필수항목:</strong> 이메일 주소</li>
              <li><strong>선택항목:</strong> 프로필 이름</li>
              <li><strong>자동수집:</strong> 서비스 이용기록, 접속 로그, 결제 기록</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              2. 개인정보의 수집 및 이용목적
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>회원 식별 및 가입의사 확인</li>
              <li>서비스 제공 및 요금 결제</li>
              <li>결제일 알림 이메일 발송</li>
              <li>월간 리포트 이메일 발송</li>
              <li>고객 문의 응대</li>
              <li>서비스 개선 및 신규 서비스 개발</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              3. 개인정보의 보유 및 이용기간
            </h2>
            <p>
              회원의 개인정보는 서비스 이용계약 기간 동안 보유하며,
              회원 탈퇴 시 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이
              필요한 경우 해당 기간 동안 보관합니다:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              4. 개인정보의 제3자 제공
            </h2>
            <p>
              서비스는 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>회원이 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              5. 개인정보 처리 위탁
            </h2>
            <p>서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보를 위탁하고 있습니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase:</strong> 데이터베이스 호스팅 및 인증 서비스</li>
              <li><strong>Stripe:</strong> 결제 처리</li>
              <li><strong>Resend:</strong> 이메일 발송</li>
              <li><strong>Vercel:</strong> 웹 서비스 호스팅</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              6. 회원의 권리와 행사 방법
            </h2>
            <p>회원은 언제든지 다음의 권리를 행사할 수 있습니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>개인정보 열람 요구</li>
              <li>개인정보 정정 요구</li>
              <li>개인정보 삭제 요구</li>
              <li>개인정보 처리정지 요구</li>
            </ul>
            <p className="mt-4">
              위 권리 행사는 이메일(support@mysubs.app)을 통해 요청할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              7. 개인정보의 안전성 확보 조치
            </h2>
            <p>서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>비밀번호 암호화 저장</li>
              <li>SSL/TLS 암호화 통신</li>
              <li>개인정보 접근 제한</li>
              <li>정기적인 보안 점검</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              8. 쿠키(Cookie)의 사용
            </h2>
            <p>
              서비스는 회원 인증 및 서비스 이용을 위해 쿠키를 사용합니다.
              회원은 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나,
              이 경우 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              9. 개인정보 보호책임자
            </h2>
            <p>
              개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              회원의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를
              지정하고 있습니다.
            </p>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p><strong>개인정보 보호책임자</strong></p>
              <p>이메일: support@mysubs.app</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              10. 개인정보처리방침 변경
            </h2>
            <p>
              이 개인정보처리방침은 법령, 정책 또는 보안기술의 변경에 따라
              내용의 추가, 삭제 및 수정이 있을 수 있으며, 변경 시 서비스 내
              공지사항을 통해 고지합니다.
            </p>
          </section>

          <section className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              시행일: 2025년 1월 1일
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
