import Navigation from '@/components/ui/Navigation'
import { ProfileProvider } from '@/components/ui/ProfileContext'
import DashboardContent from './DashboardContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'マイ家計ダッシュボード｜生活お金ナビ',
  description: 'ふるさと納税・NISA・iDeCo・固定費見直しなど、あなたの家計に合わせた節税・節約情報を一覧で確認できます。',
}

export default function DashboardPage() {
  return (
    <ProfileProvider>
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-8">
        <DashboardContent />
      </main>
    </ProfileProvider>
  )
}
