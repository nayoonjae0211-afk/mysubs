'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 실제로는 이메일 전송 API를 호출하거나 폼 데이터를 저장
    // 여기서는 mailto 링크로 대체
    const mailtoLink = `mailto:support@mysubs.app?subject=${encodeURIComponent(
      `[MySubs 문의] ${subject}`
    )}&body=${encodeURIComponent(
      `이름: ${name}\n이메일: ${email}\n\n${message}`
    )}`;

    window.location.href = mailtoLink;

    // 짧은 딜레이 후 제출 완료 표시
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            문의가 접수되었습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            이메일 앱이 열렸습니다. 메일을 보내주시면 빠르게 답변 드리겠습니다.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            문의하기
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            궁금한 점이나 건의사항이 있으시면 언제든지 문의해주세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    이메일 문의
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    24시간 내 답변 드립니다
                  </p>
                </div>
              </div>
              <a
                href="mailto:support@mysubs.app"
                className="text-blue-600 hover:underline"
              >
                support@mysubs.app
              </a>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <MessageSquare className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    자주 묻는 질문
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    빠른 답변을 찾아보세요
                  </p>
                </div>
              </div>
              <Link
                href="/pricing#faq"
                className="text-purple-600 hover:underline"
              >
                FAQ 보러가기
              </Link>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-2">빠른 답변이 필요하신가요?</h3>
              <p className="text-sm text-white/80 mb-4">
                결제, 구독 취소, 환불 관련 문의는 제목에 [긴급]을 붙여주세요.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  문의 유형
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="">선택해주세요</option>
                  <option value="일반 문의">일반 문의</option>
                  <option value="결제 문의">결제 문의</option>
                  <option value="환불 요청">환불 요청</option>
                  <option value="기능 제안">기능 제안</option>
                  <option value="버그 신고">버그 신고</option>
                  <option value="제휴 문의">제휴 문의</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  문의 내용
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                  placeholder="문의 내용을 자세히 적어주세요."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  '전송 중...'
                ) : (
                  <>
                    <Send size={18} />
                    문의하기
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
