'use client'
import { useState } from 'react'
import { useProfile } from './ProfileContext'
import { INCOME_OPTIONS, FAMILY_OPTIONS } from '@/lib/profile'
import { UserProfile } from '@/types'

interface Props {
  onSubmit?: (p: UserProfile) => void
  compact?: boolean
}

export default function ProfileForm({ onSubmit, compact = false }: Props) {
  const { profile, setProfile } = useProfile()
  const [local, setLocal] = useState(profile)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setProfile(local)
    onSubmit?.(local)
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-32">
          <select
            value={local.income}
            onChange={e => setLocal(p => ({ ...p, income: Number(e.target.value) }))}
            className="select-field text-sm py-2"
          >
            {INCOME_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-32">
          <select
            value={local.family}
            onChange={e => setLocal(p => ({ ...p, family: e.target.value as UserProfile['family'] }))}
            className="select-field text-sm py-2"
          >
            {FAMILY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary py-2 px-4 text-sm">更新</button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          年収の目安を教えてください
        </label>
        <select
          value={local.income}
          onChange={e => setLocal(p => ({ ...p, income: Number(e.target.value) }))}
          className="select-field"
        >
          <option value="">選択してください</option>
          {INCOME_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          家族の構成を教えてください
        </label>
        <select
          value={local.family}
          onChange={e => setLocal(p => ({ ...p, family: e.target.value as UserProfile['family'] }))}
          className="select-field"
        >
          {FAMILY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn-primary w-full">
        お得情報を見る →
      </button>

      <p className="text-xs text-gray-400 text-center">
        入力情報はブラウザ内にのみ保存されます。外部に送信されません。
      </p>
    </form>
  )
}
