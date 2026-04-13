export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="skeleton h-4 w-64 rounded" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card space-y-3">
          <div className="flex gap-3">
            <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-4 rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          </div>
          <div className="skeleton h-10 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
