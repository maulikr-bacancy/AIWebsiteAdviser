import Link from 'next/link'

export default function ReportCard({ report }: { report: any }) {
  const score = report.clarity_score ?? 0
  const isGood = score >= 70
  const isMid = score >= 40
  const scoreColor = isGood ? 'text-green-400' : isMid ? 'text-yellow-400' : 'text-red-400'
  const scoreBg = isGood ? 'bg-green-500/10 border-green-500/20' : isMid ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'
  const scoreLabel = isGood ? 'Good' : isMid ? 'Needs Work' : 'Poor'

  const hostname = (() => {
    try { return new URL(report.url).hostname.replace('www.', '') }
    catch { return report.url }
  })()

  return (
    <Link
      href={`/report/${report.id}`}
      className="group glass rounded-2xl p-5 border border-white/5 hover:border-pink-500/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/10 flex flex-col gap-4 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-300 mb-0.5">Analyzed website</p>
          <p className="text-sm font-semibold text-white truncate">{hostname}</p>
        </div>
        <div className={`flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl border ${scoreBg}`}>
          <span className={`text-xl font-black leading-none ${scoreColor}`}>{score}</span>
          <span className={`text-[10px] font-semibold ${scoreColor}`}>{scoreLabel}</span>
        </div>
      </div>

      {/* Roast preview */}
      {report.roast && (
        <div className="bg-gradient-to-br from-orange-500/8 to-pink-500/8 border border-orange-500/15 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">The Roast</span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed italic">"{report.roast}"</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-slate-500">
          {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className="text-xs text-pink-400 group-hover:text-pink-300 font-semibold flex items-center gap-1 transition-colors">
          View report
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </span>
      </div>
    </Link>
  )
}
