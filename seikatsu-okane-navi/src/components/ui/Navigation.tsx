'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/',          label: 'ホーム',    emoji: '🏠' },
  { href: '/news',      label: '今日のニュース', emoji: '📰' },
  { href: '/dashboard', label: 'マイ家計',  emoji: '📊' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <>
      {/* トップナビ（デスクトップ） */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-surface-border hidden sm:block">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="font-display font-bold text-primary text-lg">生活お金ナビ</span>
          </Link>
          <nav className="flex gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary-light text-primary'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.emoji} {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ボトムナビ（モバイル） */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-border sm:hidden">
        <div className="flex">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                pathname === item.href
                  ? 'text-primary'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl mb-0.5">{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* モバイル用スペーサー */}
      <div className="h-16 sm:hidden" />
    </>
  )
}
