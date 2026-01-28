import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          이용약관
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              제1조 (목적)
            </h2>
            <p>
              이 약관은 MySubs (이하 &quot;서비스&quot;)가 제공하는 구독 관리 서비스의 이용조건 및 절차,
              회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              제2조 (정의)
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>&quot;서비스&quot;란 MySubs가 제공하는 구독 관리 플랫폼을 말합니다.</li>
              <li>&quot;회원&quot;이란 서비스에 가입하여 이용계약을 체결한 자를 말합니다.</li>
              <li>&quot;프로 회원&quot;이란 유료 결제를 통해 프리미엄 기능을 이용하는 회원을 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              제3조 (서비스의 제공)
            </h2>
            <p>서비스는 다음과 같은 기능을 제공합니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>구독 서비스 등록 및 관리</li>
              <li>월간/연간 지출 현황 분석</li>
              <li>결제일 알림 (프로 회원)</li>
              <li>월간 리포트 이메일 (프로 회원)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              제4조 (회원가입)
            </h2>
            <p>
              회원가입은 이용자가 약관의 내용에 동의한 후, 회원가입 신청을 하고 서비스가
              이를 승낙함으로써 성립됩니다. 회원은 가입 시 정확한 정보를 제공해야 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              제5조 (유료 서비스)
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>프로 플랜은 월 4,900원의 구독료가 부과됩니다.</li>
              <li>결제는 매월 자동으로 갱신됩니다.</li>
              <li>환불은 결제일로부터 7일 이내에 요청할 수 있습니다.</li>
              <li>구독 취소는 언제든지 가능하며, 취소 후에도 결제 기간 종료일까지 서비스를 이용할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              제6조 (회원의 의무)
            </h2>
            <p>회원은 다음 행위를 하여서는 안 됩니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>타인의 정보 도용</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>서비스를 이용한 불법 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              제7조 (면책조항)
            </h2>
            <p>
              서비스는 회원이 등록한 구독 정보의 정확성을 보장하지 않으며,
              실제 결제 금액이나 결제일은 각 구독 서비스 제공업체의 정책에 따릅니다.
              서비스의 알림은 참고용이며, 실제 결제 관리는 회원의 책임입니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              제8조 (약관의 변경)
            </h2>
            <p>
              서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내
              공지사항을 통해 공지합니다. 변경된 약관에 동의하지 않는 회원은
              서비스 이용을 중단하고 탈퇴할 수 있습니다.
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
