'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, Mail, Calendar, FileText, Save, Loader2, Crown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface NotificationSettings {
  billingReminder: boolean;
  billingReminderDays: number;
  trialEndingReminder: boolean;
  trialEndingDays: number;
  monthlyReport: boolean;
  monthlyReportDay: number;
  emailNotifications: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  billingReminder: true,
  billingReminderDays: 3,
  trialEndingReminder: true,
  trialEndingDays: 3,
  monthlyReport: true,
  monthlyReportDay: 1,
  emailNotifications: true,
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      // 프로 상태 확인
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_pro, notification_settings')
        .eq('id', user.id)
        .single();

      if (profile) {
        setIsPro(profile.is_pro);
        if (profile.notification_settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...profile.notification_settings });
        }
      }

      setLoading(false);
    }

    loadData();
  }, [router, supabase]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ notification_settings: settings })
        .eq('id', user.id);

      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
            대시보드로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            알림 설정
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            결제일 알림, 무료체험 종료 알림, 월간 리포트 설정을 관리하세요.
          </p>
        </div>

        {!isPro && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 mb-6 text-white">
            <div className="flex items-center gap-3">
              <Crown size={24} />
              <div className="flex-1">
                <p className="font-semibold">프로 전용 기능</p>
                <p className="text-sm text-white/80">알림 기능은 프로 사용자만 이용할 수 있습니다.</p>
              </div>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors"
              >
                업그레이드
              </Link>
            </div>
          </div>
        )}

        <div className={`space-y-6 ${!isPro ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Email Notifications Master Toggle */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    이메일 알림
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    모든 이메일 알림을 받습니다
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Billing Reminder */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <Bell className="text-amber-600 dark:text-amber-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    결제일 알림
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    결제일 전에 이메일로 알려드립니다
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.billingReminder}
                  onChange={(e) => setSettings({ ...settings, billingReminder: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {settings.billingReminder && (
              <div className="ml-16 flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">결제</span>
                <select
                  value={settings.billingReminderDays}
                  onChange={(e) => setSettings({ ...settings, billingReminderDays: parseInt(e.target.value) })}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                >
                  <option value={1}>1일</option>
                  <option value={2}>2일</option>
                  <option value={3}>3일</option>
                  <option value={5}>5일</option>
                  <option value={7}>7일</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">전에 알림</span>
              </div>
            )}
          </div>

          {/* Trial Ending Reminder */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Calendar className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    무료체험 종료 알림
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    무료체험 종료 전에 알려드립니다
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.trialEndingReminder}
                  onChange={(e) => setSettings({ ...settings, trialEndingReminder: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {settings.trialEndingReminder && (
              <div className="ml-16 flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">종료</span>
                <select
                  value={settings.trialEndingDays}
                  onChange={(e) => setSettings({ ...settings, trialEndingDays: parseInt(e.target.value) })}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                >
                  <option value={1}>1일</option>
                  <option value={2}>2일</option>
                  <option value={3}>3일</option>
                  <option value={5}>5일</option>
                  <option value={7}>7일</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">전에 알림</span>
              </div>
            )}
          </div>

          {/* Monthly Report */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FileText className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    월간 리포트
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    매월 구독 지출 리포트를 보내드립니다
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.monthlyReport}
                  onChange={(e) => setSettings({ ...settings, monthlyReport: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {settings.monthlyReport && (
              <div className="ml-16 flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">매월</span>
                <select
                  value={settings.monthlyReportDay}
                  onChange={(e) => setSettings({ ...settings, monthlyReportDay: parseInt(e.target.value) })}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                >
                  <option value={1}>1일</option>
                  <option value={5}>5일</option>
                  <option value={10}>10일</option>
                  <option value={15}>15일</option>
                  <option value={25}>25일</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">에 발송</span>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !isPro}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                저장 중...
              </>
            ) : saved ? (
              <>
                <Save size={20} />
                저장되었습니다!
              </>
            ) : (
              <>
                <Save size={20} />
                설정 저장
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
