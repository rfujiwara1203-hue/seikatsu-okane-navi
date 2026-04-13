'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-4">😓</p>
      <h2 className="text-lg font-bold text-gray-800 mb-2">
        読み込みに失敗しました
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        通信エラーが発生しました。時間をおいて再度お試しください。
      </p>
      <button onClick={reset} className="btn-primary">
        再読み込み
      </button>
    </div>
  )
}
