import { UserProfile, FamilyType, FS_LIMITS, SHIENKIN } from '@/types'

export function getFsLimit(profile: UserProfile): number {
  const table = FS_LIMITS[profile.family]
  if (!table) return 0
  const incomes = Object.keys(table).map(Number).sort((a, b) => a - b)
  let closest = incomes[0]
  for (const inc of incomes) {
    if (inc <= profile.income) closest = inc
    else break
  }
  return table[closest] ?? 0
}

export function getShienkin(profile: UserProfile): number {
  const incomes = Object.keys(SHIENKIN).map(Number).sort((a, b) => a - b)
  let closest = incomes[0]
  for (const inc of incomes) {
    if (inc <= profile.income) closest = inc
    else break
  }
  return SHIENKIN[closest] ?? 4600
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ja-JP') + '円'
}

export function getDefaultProfile(): UserProfile {
  return { income: 500, family: 'single' }
}

export const INCOME_OPTIONS = [
  { value: 150, label: '〜200万円' },
  { value: 200, label: '200〜300万円' },
  { value: 300, label: '300〜400万円' },
  { value: 400, label: '400〜500万円' },
  { value: 500, label: '500〜600万円' },
  { value: 600, label: '600〜700万円' },
  { value: 700, label: '700〜800万円' },
  { value: 800, label: '800〜1000万円' },
  { value: 1000, label: '1000〜1200万円' },
  { value: 1200, label: '1200万円以上' },
]

export const FAMILY_OPTIONS: { value: FamilyType; label: string }[] = [
  { value: 'single',       label: '独身' },
  { value: 'couple',       label: '夫婦（共働き）' },
  { value: 'couple_dep',   label: '夫婦（片働き）' },
  { value: 'child1',       label: '夫婦＋子1人' },
  { value: 'child2',       label: '夫婦＋子2人' },
  { value: 'child3',       label: '夫婦＋子3人以上' },
  { value: 'single_parent',label: 'ひとり親' },
]
